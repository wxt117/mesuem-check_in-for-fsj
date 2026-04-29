import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getVisitorSession } from "@/lib/session";
import { ArtifactStage } from "@/components/ArtifactStage";
import { CheckinForm } from "@/components/CheckinForm";
import { saveCheckin } from "@/app/e/[slug]/actions";

type ExhibitPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function ExhibitPage({ params, searchParams }: ExhibitPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const exhibit = await prisma.exhibit.findUnique({
    where: { slug }
  });

  if (!exhibit || !exhibit.isActive) {
    notFound();
  }

  const byline = [exhibit.artist, exhibit.period].filter(Boolean).join(", ");
  const session = await getVisitorSession();
  const checkin = session
    ? await prisma.checkin.findUnique({
        where: {
          sessionId_exhibitId: {
            sessionId: session.id,
            exhibitId: exhibit.id
          }
        }
      })
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{exhibit.gallery}</p>
          <h1>{exhibit.title}</h1>
          {byline ? <p className="subtle">{byline}</p> : null}
        </div>
        <Link className="secondary-button" href="/">
          <ArrowLeft size={18} />
          Collection
        </Link>
      </div>

      <section className="checkin-layout">
        <div className="hero-panel">
          <ArtifactStage exhibit={exhibit} />
        </div>
        <CheckinForm
          action={saveCheckin.bind(null, exhibit.id, exhibit.slug)}
          initialEmoji={checkin?.emoji}
          initialComment={checkin?.comment}
          status={
            query.saved
              ? "Saved to your visit."
              : query.error
                ? "Could not save this check-in. Please try again."
                : ""
          }
        />
      </section>
    </>
  );
}
