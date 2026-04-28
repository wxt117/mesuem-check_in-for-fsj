import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { prisma } from "@/lib/prisma";
import { exhibitPath, getBaseUrl } from "@/lib/url";

type ExhibitQrPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExhibitQrPage({ params }: ExhibitQrPageProps) {
  const { id } = await params;
  const exhibit = await prisma.exhibit.findUnique({
    where: { id },
    include: {
      _count: {
        select: { qrCodes: true }
      }
    }
  });

  if (!exhibit) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const visitorUrl = `${baseUrl}${exhibitPath(exhibit.slug)}`;
  const qrUrl = `/api/qr/${exhibit.id}`;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Printable QR</p>
          <h1>{exhibit.title}</h1>
          <p className="subtle">Print this code and place it next to the object label.</p>
        </div>
        <Link className="secondary-button" href="/admin/exhibits">
          <ArrowLeft size={18} />
          Exhibits
        </Link>
      </div>

      <section className="admin-grid">
        <div className="summary-panel">
          <div className="qr-box">
            <div className="qr-frame">
              <Image src={qrUrl} alt={`QR code for ${exhibit.title}`} width={320} height={320} unoptimized />
            </div>
            <div className="url-box">{visitorUrl}</div>
            <div className="form-actions">
              <CopyButton text={visitorUrl} label="Copy URL" />
              <a className="secondary-button" href={qrUrl} download={`${exhibit.slug}.svg`}>
                <Download size={18} />
                Download SVG
              </a>
              <a className="secondary-button" href={visitorUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={18} />
                Open page
              </a>
            </div>
          </div>
        </div>
        <aside className="side-panel">
          <div className="mini-card">
            <h2>Scan target</h2>
            <p>/e/{exhibit.slug}</p>
          </div>
          <div className="mini-card">
            <h2>QR records</h2>
            <p>{exhibit._count.qrCodes} saved database record{exhibit._count.qrCodes === 1 ? "" : "s"}.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
