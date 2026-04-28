import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const VISITOR_COOKIE = "museum_visitor";

export type VisitorCookieResult = {
  anonymousId: string;
  isNew: boolean;
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type WritableResponseCookies = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    }
  ) => void;
};

export async function getVisitorAnonymousId() {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value ?? null;
}

export async function getVisitorSession() {
  const anonymousId = await getVisitorAnonymousId();
  if (!anonymousId) return null;

  return prisma.visitorSession.findUnique({
    where: { anonymousId }
  });
}

export async function ensureVisitorSessionFromCookies(
  cookieStore: CookieStore
): Promise<VisitorCookieResult> {
  const anonymousId = cookieStore.get(VISITOR_COOKIE)?.value ?? randomUUID();
  const isNew = !cookieStore.get(VISITOR_COOKIE)?.value;

  await prisma.visitorSession.upsert({
    where: { anonymousId },
    update: {},
    create: { anonymousId }
  });

  return { anonymousId, isNew };
}

export function setVisitorCookie(responseCookies: WritableResponseCookies, anonymousId: string) {
  responseCookies.set(VISITOR_COOKIE, anonymousId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120
  });
}
