import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Confirmed-available models for this API key via ListModels (all on v1beta).
// Ordered by capability / free-tier quota generosity.
// gemini-2.0-flash       → 1,500 req/day (quota exhausted today)
// gemini-2.0-flash-001   → 1,500 req/day (pinned stable alias, separate quota)
// gemini-2.5-flash       → free tier available
// gemini-2.5-flash-lite  → free tier available
// gemini-2.0-flash-lite  → 1,500 req/day (separate quota from 2.0-flash)
// gemini-2.0-flash-lite-001 → pinned stable alias
const MODEL_CASCADE = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001",
];

/** Returns a Gemini model instance (all models use v1beta). */
export function getModel(modelName = MODEL_CASCADE[0]) {
    return genAI.getGenerativeModel({ model: modelName });
}

/** True when the error is a quota / rate-limit response. */
function isQuotaErr(msg) {
    return /429|Too Many Requests|quota|Quota exceeded/i.test(msg);
}

/** True when the daily quota for this specific model is gone. */
function isDailyExhausted(msg) {
    return /limit:\s*0/i.test(msg) || /PerDay/i.test(msg);
}

/** True when the model name isn't accessible — skip to next in cascade. */
function isModelNotFound(msg) {
    return /404|not found|not supported for generateContent/i.test(msg);
}

/**
 * Calls the Gemini API with automatic model cascade + per-minute retry logic.
 *
 * - 404 model not found      → skip to next model in cascade
 * - Daily quota exhausted    → skip to next model in cascade
 * - Per-minute rate limit    → retry same model with exponential backoff
 * - Any other error          → thrown immediately
 *
 * @param {object|string} modelOrName  Model instance (from getModel()) or model name string.
 * @param {string}        prompt
 * @param {number}        maxRetries   Per-minute retries per model (default: 2).
 * @returns {Promise<string>}          Raw text from the model.
 */
export async function callGemini(modelOrName, prompt, maxRetries = 2) {
    const startName =
        typeof modelOrName === "string"
            ? modelOrName
            : (modelOrName.model?.name ?? MODEL_CASCADE[0]);

    const startIdx = MODEL_CASCADE.indexOf(startName);
    const cascade = startIdx >= 0 ? MODEL_CASCADE.slice(startIdx) : MODEL_CASCADE;

    let lastErr;

    for (const modelName of cascade) {
        const model = genAI.getGenerativeModel({ model: modelName });

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                if (modelName !== cascade[0]) {
                    console.info(`[Gemini] Succeeded with fallback model: ${modelName}`);
                }
                return result.response.text();
            } catch (err) {
                const msg = String(err?.message || err);
                lastErr = err;

                // Model not accessible → try next.
                if (isModelNotFound(msg)) {
                    console.warn(`[Gemini] ${modelName} not found — trying next...`);
                    break;
                }

                // Not quota-related → don't cascade, just throw.
                if (!isQuotaErr(msg)) throw err;

                // Daily quota gone for this model → try next.
                if (isDailyExhausted(msg)) {
                    console.warn(`[Gemini] Daily quota exhausted for ${modelName} — trying next...`);
                    break;
                }

                // Per-minute rate limit → back off and retry same model.
                if (attempt < maxRetries - 1) {
                    const backoffMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
                    console.warn(
                        `[Gemini] Rate limited on ${modelName} (attempt ${attempt + 1}/${maxRetries}), retrying in ${backoffMs}ms`
                    );
                    await new Promise((r) => setTimeout(r, backoffMs));
                }
            }
        }
    }

    console.error("[Gemini] All cascade models exhausted. Last error:", lastErr?.message);
    throw new Error(
        "AI quota exhausted for today. Your daily limit resets at midnight (Pacific Time). " +
        "Please try again later or visit https://ai.dev/rate-limit to check your usage."
    );
}

/**
 * Like callGemini but auto-parses the response as JSON.
 * Strips markdown code fences before parsing.
 */
export async function callGeminiJSON(modelOrName, prompt, maxRetries = 2) {
    const text = await callGemini(modelOrName, prompt, maxRetries);
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleaned);
}
