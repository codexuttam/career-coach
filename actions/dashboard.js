"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getModel, callGeminiJSON } from "@/lib/gemini";

const model = getModel();

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

  // callGeminiJSON already handles: fast-fail on daily quota, retry on per-minute limits.
  return await callGeminiJSON(model, prompt);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const insight = user.industryInsight;

  // Detect placeholder / empty data saved during onboarding when AI quota was exhausted.
  // A real insight will always have salary ranges and a non-zero growth rate.
  const isPlaceholder =
    !insight ||
    (Array.isArray(insight.salaryRanges) && insight.salaryRanges.length === 0) ||
    (Array.isArray(insight.topSkills) && insight.topSkills.length === 0);

  const isStale = insight && new Date() > new Date(insight.nextUpdate);

  if (isPlaceholder || isStale) {
    try {
      const fresh = await generateAIInsights(user.industry);

      if (!insight) {
        // No record at all — create one.
        return await db.industryInsight.create({
          data: {
            industry: user.industry,
            ...fresh,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Existing placeholder/stale record — update in place.
      return await db.industryInsight.update({
        where: { industry: user.industry },
        data: {
          ...fresh,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (aiErr) {
      console.warn(
        "[getIndustryInsights] AI unavailable, returning existing data:",
        aiErr?.message
      );
      // Return whatever we have (even placeholder) so the page still renders.
      if (insight) return insight;

      // No record at all and AI failed — return a safe empty shell.
      return {
        industry: user.industry,
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "Medium",
        topSkills: [],
        marketOutlook: "Neutral",
        keyTrends: [],
        recommendedSkills: [],
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 60 * 60 * 1000), // retry in 1hr
      };
    }
  }

  return insight;
}
