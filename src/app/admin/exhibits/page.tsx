import Link from "next/link";
import { Edit, Plus, QrCode } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminExhibitsPage() {
  const exhibits = await prisma.exhibit.findMany({
    orderBy: [{ isActive: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          checkins: true,
          qrCodes: true
        }
      }
    }
  });

  const activeCount = exhibits.filter((item) => item.isActive).length;
  const checkinCount = exhibits.reduce((sum, item) => sum + item._count.checkins, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Staff admin</p>
          <h1>Exhibits and QR codes</h1>
          <p className="subtle">Manage the exhibit records that become scan targets for visitors.</p>
        </div>
        <Link className="primary-button" href="/admin/exhibits/new">
          <Plus size={18} />
          New exhibit
        </Link>
      </div>

      <section className="admin-grid">
        <div className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Exhibit</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Check-ins</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exhibits.map((exhibit) => (
                <tr key={exhibit.id}>
                  <td>
                    <strong>{exhibit.title}</strong>
                    <br />
                    <span className="subtle">
                      {exhibit.artist ? `${exhibit.artist} · ` : ""}
                      {exhibit.gallery}
                    </span>
                  </td>
                  <td>/e/{exhibit.slug}</td>
                  <td>
                    <span className={`badge ${exhibit.isActive ? "" : "is-warm"}`}>
                      {exhibit.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>{exhibit._count.checkins}</td>
                  <td>
                    <div className="form-actions">
                      <Link className="secondary-button" href={`/admin/exhibits/${exhibit.id}`}>
                        <Edit size={18} />
                        Edit
                      </Link>
                      <Link className="secondary-button" href={`/admin/exhibits/${exhibit.id}/qr`}>
                        <QrCode size={18} />
                        QR
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="side-panel">
          <div className="mini-card">
            <h2>Collection</h2>
            <p>{activeCount} active exhibit records are currently visible to visitors.</p>
          </div>
          <div className="mini-card">
            <h2>Visitor data</h2>
            <p>{checkinCount} check-ins have been saved across this database.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
