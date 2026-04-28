import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAiSummary } from "@/lib/summary";
import { VISITOR_COOKIE } from "@/lib/session";

export const maxDuration = 30;

export async function POST() {
  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!anonymousId) {
    return NextResponse.json({ error: "No visitor session." }, { status: 400 });
  }

  const session = await prisma.visitorSession.findUnique({
    where: { anonymousId }
  });

  if (!session) {
    return NextResponse.json({ error: "No visitor session." }, { status: 400 });
  }

  const checkins = await prisma.checkin.findMany({
    where: { sessionId: session.id },
    include: { exhibit: true },
    orderBy: { updatedAt: "asc" }
  });

  if (!checkins.length) {
    return NextResponse.json({ error: "No check-ins yet." }, { status: 400 });
  }

  const result = await buildAiSummary(checkins);
  const summary = await prisma.summary.create({
    data: {
      sessionId: session.id,
      content: result.content,
      keywordsJson: JSON.stringify(result.keywords),
      mood: result.mood,
      model: result.model,
      sourceHash: result.sourceHash
    }
  });

  return NextResponse.json({ summary });
}
