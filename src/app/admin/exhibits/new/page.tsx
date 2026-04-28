import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExhibitForm } from "@/components/ExhibitForm";
import { createExhibit } from "@/app/admin/exhibits/actions";

export default function NewExhibitPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Staff admin</p>
          <h1>New exhibit</h1>
          <p className="subtle">Create a scan target and visitor-facing record.</p>
        </div>
        <Link className="secondary-button" href="/admin/exhibits">
          <ArrowLeft size={18} />
          Exhibits
        </Link>
      </div>
      <ExhibitForm action={createExhibit} submitLabel="Create exhibit" />
    </>
  );
}
