import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getVisitorSession } from "@/lib/session";
import { buildLocalSummary, sourceHashForCheckins } from "@/lib/summary";
import { generateSummary } from "@/app/summary/actions";

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

type SummaryPageProps = {
  searchParams: Promise<{
    generated?: string;
    error?: string;
  }>;
};

function summaryStatus(generated?: string, error?: string) {
  if (generated) return "Summary generated.";
  if (error === "ai") return "Could not generate with AI. Check your API key and model settings.";
  if (error === "empty") return "Save at least one check-in first.";
  if (error === "session") return "No visitor session found on this device.";
  if (error) return "Could not generate a summary yet.";
  return "";
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  const query = await searchParams;
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

  const currentHash = sourceHashForCheckins(checkins);
  const savedSummary = await prisma.summary.findFirst({
    where: { sessionId: session.id },
    orderBy: { createdAt: "desc" }
  });
  const localSummary = buildLocalSummary(checkins);
  const content = savedSummary?.content ?? localSummary.content;
  const keywords = savedSummary ? parseKeywords(savedSummary.keywordsJson) : localSummary.keywords;
  const mood = savedSummary?.mood ?? localSummary.mood;
  const model = savedSummary?.model ?? localSummary.model;
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
            <li>Source: {model === "local-fallback" ? "local fallback" : model}</li>
            {summaryTime ? <li>Generated at: {summaryTime}</li> : null}
          </ul>
        </article>
        <aside className="side-panel">
          <div className="mini-card">
            <h2>Generate</h2>
            <p>Generate a fresh summary from this visitor session. DeepSeek is used when configured.</p>
            <form action={generateSummary}>
              <button className="primary-button" type="submit">
                <Sparkles size={18} />
                Generate AI summary
              </button>
            </form>
            <p className="status-message">{summaryStatus(query.generated, query.error)}</p>
          </div>
          <div className="mini-card">
            <h2>Mood trail</h2>
            <div className="mood-bars">{moodRows(checkins)}</div>
          </div>
          <div className="mini-card">
            <h2>Objects</h2>
            <p>{checkins.map((item) => `${item.emoji} ${item.exhibit.title}`).join(", ")}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
