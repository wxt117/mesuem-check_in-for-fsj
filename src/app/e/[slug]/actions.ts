"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VISITOR_COOKIE } from "@/lib/session";

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

export async function saveCheckin(exhibitId: string, slug: string, formData: FormData) {
  const emoji = String(formData.get("emoji") || "");
  const comment = String(formData.get("comment") || "").trim();

  if (!allowedEmoji.has(emoji)) {
    redirect(`/e/${slug}?error=emoji`);
  }

  const exhibit = await prisma.exhibit.findUnique({
    where: { id: exhibitId }
  });

  if (!exhibit || !exhibit.isActive) {
    redirect(`/e/${slug}?error=exhibit`);
  }

  const cookieStore = await cookies();
  const anonymousId = cookieStore.get(VISITOR_COOKIE)?.value ?? randomUUID();

  if (!cookieStore.get(VISITOR_COOKIE)?.value) {
    cookieStore.set(VISITOR_COOKIE, anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 120
    });
  }

  const session = await prisma.visitorSession.upsert({
    where: { anonymousId },
    update: {},
    create: { anonymousId }
  });

  await prisma.checkin.upsert({
    where: {
      sessionId_exhibitId: {
        sessionId: session.id,
        exhibitId
      }
    },
    update: {
      emoji,
      comment: comment || null
    },
    create: {
      sessionId: session.id,
      exhibitId,
      emoji,
      comment: comment || null
    }
  });

  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath(`/e/${slug}`);
  redirect(`/e/${slug}?saved=1`);
}
