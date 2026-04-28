import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getVisitorSession } from "@/lib/session";
import { buildAiSummary, sourceHashForCheckins, type CheckinWithExhibit } from "@/lib/summary";

export const maxDuration = 30;

function parseKeywords(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function moodRows(checkins: { emoji: string }[]) {
  const counts = checkins.reduce<Record<string, number>>((acc, item) => {
    acc[item.emoji] = (acc[item.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const max = Math.max(1, ...Object.values(counts));

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([emoji, count]) => (
      <div className="mood-row" key={emoji}>
        <span>{emoji}</span>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${Math.round((count / max) * 100)}%` }} />
        </div>
        <strong>{count}</strong>
      </div>
    ));
}

async function getCurrentSummary(sessionId: string, checkins: CheckinWithExhibit[]) {
  const currentHash = sourceHashForCheckins(checkins);
  const savedSummary = await prisma.summary.findFirst({
    where: {
      sessionId,
      sourceHash: currentHash
    },
    orderBy: { createdAt: "desc" }
  });

  if (savedSummary) {
    return {
      summary: savedSummary,
      error: ""
    };
  }

  try {
    const result = await buildAiSummary(checkins);
    const summary = await prisma.summary.create({
      data: {
        sessionId,
        content: result.content,
        keywordsJson: JSON.stringify(result.keywords),
        mood: result.mood,
        model: result.model,
        sourceHash: result.sourceHash
      }
    });

    return {
      summary,
      error: ""
    };
  } catch (error) {
    console.error("Summary generation failed", error);
    return {
      summary: null,
      error: "Could not generate an AI summary. Check your API key and model settings."
    };
  }
}

export default async function SummaryPage() {
  const session = await getVisitorSession();
  const checkins = session
    ? await prisma.checkin.findMany({
        where: { sessionId: session.id },
        include: { exhibit: true },
        orderBy: { updatedAt: "asc" }
      })
    : [];

  if (!session || !checkins.length) {
    return (
      <>
        <div className="page-head">
          <div>
            <p className="kicker">Visit summary</p>
            <h1>Start with one object</h1>
            <p className="subtle">Your summary is built from the Emoji and comments saved during this visit.</p>
          </div>
          <Link className="primary-button" href="/">
            <ArrowLeft size={18} />
            Pick an exhibit
          </Link>
        </div>
        <section className="empty-state">
          <div>
            <h2>No check-ins yet</h2>
            <p>Scan an exhibit QR code or open one of the exhibit entrances on the home page.</p>
          </div>
        </section>
      </>
    );
  }

  const { summary: savedSummary, error: generationError } = await getCurrentSummary(session.id, checkins);
  const content = savedSummary?.content ?? generationError;
  const keywords = savedSummary ? parseKeywords(savedSummary.keywordsJson) : [];
  const mood = savedSummary?.mood ?? "AI summary unavailable";
  const summaryTime = savedSummary
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(savedSummary.createdAt)
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Visit summary</p>
          <h1>Your exhibition reflection</h1>
          <p className="subtle">Based on {checkins.length} saved reaction{checkins.length > 1 ? "s" : ""}.</p>
        </div>
        <Link className="secondary-button" href="/">
          <ArrowLeft size={18} />
          Collection
        </Link>
      </div>

      <section className="summary-grid">
        <article className="summary-panel">
          <h2>Summary</h2>
          <p className="summary-text">{content}</p>
          <ul className="insight-list">
            <li>Mood: {mood}</li>
            <li>Keywords: {keywords.length ? keywords.join(", ") : "not enough data yet"}</li>
            {summaryTime ? <li>Generated at: {summaryTime}</li> : null}
          </ul>
        </article>
        <aside className="side-panel">
          <div className="mini-card">
            <h2>Mood trail</h2>
            <div className="mood-bars">{moodRows(checkins)}</div>
          </div>
          <div className="mini-card">
            <h2>Objects</h2>
            <ul className="object-list">
              {checkins.map((item) => (
                <li key={item.id}>
                  <span className="object-emoji">{item.emoji}</span>
                  <span>{item.exhibit.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
