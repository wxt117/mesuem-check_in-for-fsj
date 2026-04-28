"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildAiSummary } from "@/lib/summary";
import { VISITOR_COOKIE } from "@/lib/session";

export async function generateSummary() {
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!anonymousId) {
    redirect("/summary?error=session");
  }

  const session = await prisma.visitorSession.findUnique({
    where: { anonymousId }
  });

  if (!session) {
    redirect("/summary?error=session");
  }

  const checkins = await prisma.checkin.findMany({
    where: { sessionId: session.id },
    include: { exhibit: true },
    orderBy: { updatedAt: "asc" }
  });

  if (!checkins.length) {
    redirect("/summary?error=empty");
  }

  try {
    const result = await buildAiSummary(checkins);

    await prisma.summary.create({
      data: {
        sessionId: session.id,
        content: result.content,
        keywordsJson: JSON.stringify(result.keywords),
        mood: result.mood,
        model: result.model,
        sourceHash: result.sourceHash
      }
    });
  } catch (error) {
    console.error("Summary generation failed", error);
    redirect("/summary?error=ai");
  }

  revalidatePath("/summary");
  redirect("/summary?generated=1");
}
