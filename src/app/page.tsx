import Link from "next/link";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getVisitorSession } from "@/lib/session";
import { ExhibitCard } from "@/components/ExhibitCard";

function favoriteEmoji(checkins: { emoji: string }[]) {
  const counts = checkins.reduce<Record<string, number>>((acc, item) => {
    acc[item.emoji] = (acc[item.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
}

export default async function HomePage() {
  const [exhibits, session] = await Promise.all([
    prisma.exhibit.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
    }),
    getVisitorSession()
  ]);

  const checkins = session
    ? await prisma.checkin.findMany({
        where: { sessionId: session.id },
        include: { exhibit: true },
        orderBy: { updatedAt: "desc" }
      })
    : [];

  const checkinsByExhibit = new Map(checkins.map((item) => [item.exhibitId, item]));

  return (
    <>
      <div className="page-head collection-head">
        <div>
          <p className="kicker">Visit trail</p>
          <h1>Collection check-in</h1>
          <p className="subtle">
            Scan a painting QR code, choose an Emoji, and save a short note. Your reactions build into a personal museum
            visit summary.
          </p>
        </div>
        <div className="collection-actions">
          <Link className="primary-button" href="/summary">
            <Sparkles size={18} />
            Summary
          </Link>
        </div>
      </div>

      <div className="stats-row collection-stats" aria-label="Visit statistics">
        <div className="stat">
          <strong>{checkins.length}</strong>
          <span>Checked in</span>
        </div>
        <div className="stat">
          <strong>{exhibits.length}</strong>
          <span>Paintings</span>
        </div>
        <div className="stat">
          <strong>{favoriteEmoji(checkins)}</strong>
          <span>Main mood</span>
        </div>
      </div>

      <section className="exhibit-section">
        <div className="section-title-row">
          <h2>Paintings</h2>
          <span className="badge">
            {checkins.length}/{exhibits.length}
          </span>
        </div>
        <div className="exhibit-grid">
          {exhibits.map((exhibit) => (
            <ExhibitCard exhibit={exhibit} checkin={checkinsByExhibit.get(exhibit.id)} key={exhibit.id} />
          ))}
        </div>
      </section>
    </>
  );
}
