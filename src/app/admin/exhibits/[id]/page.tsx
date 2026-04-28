import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ExhibitForm } from "@/components/ExhibitForm";
import { updateExhibit } from "@/app/admin/exhibits/actions";

type EditExhibitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExhibitPage({ params }: EditExhibitPageProps) {
  const { id } = await params;
  const exhibit = await prisma.exhibit.findUnique({
    where: { id }
  });

  if (!exhibit) {
    notFound();
  }

  const action = updateExhibit.bind(null, exhibit.id);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Staff admin</p>
          <h1>{exhibit.title}</h1>
          <p className="subtle">Edit the exhibit metadata used by visitor pages and QR codes.</p>
        </div>
        <div className="form-actions">
          <Link className="secondary-button" href="/admin/exhibits">
            <ArrowLeft size={18} />
            Exhibits
          </Link>
          <Link className="secondary-button" href={`/admin/exhibits/${exhibit.id}/qr`}>
            <QrCode size={18} />
            QR
          </Link>
        </div>
      </div>
      <ExhibitForm action={action} exhibit={exhibit} submitLabel="Save changes" />
    </>
  );
}
