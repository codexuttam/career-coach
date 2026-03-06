"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  // Retry loop for transient failures like rate limits (429). If retries fail,
  // rethrow so callers can decide on fallback behavior.
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      return JSON.parse(cleanedText);
    } catch (err) {
      // If it's a 429 or mentions quota, treat as retryable. Otherwise rethrow.
      const msg = String(err?.message || err);
      const isRetryable = /429|Too Many Requests|quota|Quota exceeded/i.test(msg);

      // Last attempt -> rethrow
      if (attempt === maxRetries - 1 || !isRetryable) {
        // attach attempt info for debugging
        err.attempts = attempt + 1;
        throw err;
      }

      // exponential backoff with jitter
      const backoffMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`generateAIInsights: transient error (attempt ${attempt + 1}), retrying in ${backoffMs}ms:`, msg);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }
  }
  // Shouldn't reach here, but throw defensively
  throw new Error("Failed to generate AI insights");
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
