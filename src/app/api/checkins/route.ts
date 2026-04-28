import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureVisitorSessionFromCookies, setVisitorCookie } from "@/lib/session";

const allowedEmoji = new Set([
  "\u{1f604}",
  "\u{1f622}",
  "\u{1f60c}",
  "\u{1f914}",
  "\u{1f979}",
  "\u{1f60e}",
  "\u{1f628}",
  "\u{1f635}"
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        exhibitId?: string;
        emoji?: string;
        comment?: string;
      }
    | null;

  if (!body?.exhibitId || !body.emoji || !allowedEmoji.has(body.emoji)) {
    return NextResponse.json({ error: "Invalid check-in payload." }, { status: 400 });
  }

  const exhibit = await prisma.exhibit.findUnique({
    where: { id: body.exhibitId }
  });

  if (!exhibit || !exhibit.isActive) {
    return NextResponse.json({ error: "Exhibit not found." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const visitor = await ensureVisitorSessionFromCookies(cookieStore);
  const session = await prisma.visitorSession.findUniqueOrThrow({
    where: { anonymousId: visitor.anonymousId }
  });

  const checkin = await prisma.checkin.upsert({
    where: {
      sessionId_exhibitId: {
        sessionId: session.id,
        exhibitId: exhibit.id
      }
    },
    update: {
      emoji: body.emoji,
      comment: body.comment?.trim() || null
    },
    create: {
      sessionId: session.id,
      exhibitId: exhibit.id,
      emoji: body.emoji,
      comment: body.comment?.trim() || null
    }
  });

  const response = NextResponse.json({ checkin });
  if (visitor.isNew) {
    setVisitorCookie(response.cookies, visitor.anonymousId);
  }

  return response;
}
