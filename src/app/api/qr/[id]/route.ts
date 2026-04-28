import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exhibitPath, getBaseUrl } from "@/lib/url";

type QRRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: QRRouteProps) {
  const { id } = await params;
  const exhibit = await prisma.exhibit.findUnique({
    where: { id }
  });

  if (!exhibit) {
    return NextResponse.json({ error: "Exhibit not found." }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? await getBaseUrl() : new URL(request.url).origin;
  const url = `${baseUrl}${exhibitPath(exhibit.slug)}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 720,
    color: {
      dark: "#17181c",
      light: "#ffffff"
    }
  });

  const existingCode = await prisma.qRCode.findFirst({
    where: {
      exhibitId: exhibit.id,
      url
    }
  });

  if (!existingCode) {
    await prisma.qRCode.create({
      data: {
        exhibitId: exhibit.id,
        url,
        format: "svg",
        label: `${exhibit.title} QR`
      }
    });
  }

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
