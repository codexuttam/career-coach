"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Step 1: Ensure industryInsight exists BEFORE the user-update transaction.
    // We do this outside the transaction so that a slow AI call doesn't hold
    // a DB connection open, and so a failed AI call doesn't roll back the user update.
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    if (!industryInsight) {
      // Try to generate AI insights. On failure (quota / rate-limit), fall back
      // to safe placeholder values so onboarding can still complete.
      let insights;
      try {
        insights = await generateAIInsights(data.industry);
      } catch (aiErr) {
        console.warn(
          "generateAIInsights quota/rate-limit hit – using placeholder insights:",
          aiErr?.message || aiErr
        );
        insights = {
          salaryRanges: [],   // Json[]  — empty array is valid
          growthRate: 0,
          demandLevel: "Medium",
          topSkills: [],
          marketOutlook: "Neutral",
          keyTrends: [],
          recommendedSkills: [],
        };
      }

      try {
        industryInsight = await db.industryInsight.create({
          data: {
            industry: data.industry,
            salaryRanges: insights.salaryRanges ?? [],
            growthRate: insights.growthRate ?? 0,
            demandLevel: insights.demandLevel ?? "Medium",
            topSkills: insights.topSkills ?? [],
            marketOutlook: insights.marketOutlook ?? "Neutral",
            keyTrends: insights.keyTrends ?? [],
            recommendedSkills: insights.recommendedSkills ?? [],
            nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      } catch (createErr) {
        // Another request might have created the record concurrently (race condition).
        // If so, just fetch the existing one and move on.
        if (createErr?.code === "P2002") {
          industryInsight = await db.industryInsight.findUnique({
            where: { industry: data.industry },
          });
        } else {
          throw createErr;
        }
      }
    }

    // Step 2: Update the user record inside a short transaction.
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    revalidatePath("/");
    return { success: true, ...updatedUser };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
