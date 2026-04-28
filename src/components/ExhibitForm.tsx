import type { Exhibit } from "@prisma/client";
import { Save } from "lucide-react";

type ExhibitFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  exhibit?: Exhibit;
  submitLabel: string;
};

export function ExhibitForm({ action, exhibit, submitLabel }: ExhibitFormProps) {
  return (
    <form className="form-panel" action={action}>
      <div className="field-grid">
        <label className="field">
          <span>Title</span>
          <input name="title" required defaultValue={exhibit?.title} placeholder="Head of a Hound" />
        </label>
        <label className="field">
          <span>QR slug</span>
          <input name="slug" required defaultValue={exhibit?.slug} placeholder="head-of-a-hound" />
        </label>
        <div className="inline-fields">
          <label className="field">
            <span>Artist</span>
            <input name="artist" defaultValue={exhibit?.artist ?? ""} placeholder="Pieter Boel" />
          </label>
          <label className="field">
            <span>Display order</span>
            <input name="displayOrder" type="number" defaultValue={exhibit?.displayOrder ?? 0} min={0} />
          </label>
        </div>
        <div className="inline-fields">
          <label className="field">
            <span>Room</span>
            <input name="gallery" defaultValue={exhibit?.gallery} placeholder="Room 1" />
          </label>
          <label className="field">
            <span>Period</span>
            <input name="period" defaultValue={exhibit?.period ?? ""} placeholder="c.1660-5" />
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <textarea name="description" required defaultValue={exhibit?.description} />
        </label>
        <label className="field">
          <span>Image filename</span>
          <input name="imageUrl" defaultValue={exhibit?.imageUrl ?? ""} placeholder="Head of a Hound.jpg" />
        </label>
        <div className="inline-fields">
          <label className="field">
            <span>Symbol</span>
            <input name="symbol" defaultValue={exhibit?.symbol ?? "Art"} maxLength={12} />
          </label>
          <label className="field">
            <span>Active</span>
            <input name="isActive" type="checkbox" defaultChecked={exhibit?.isActive ?? true} />
          </label>
        </div>
        <div className="inline-fields">
          <label className="field">
            <span>Colour A</span>
            <input name="colorA" type="color" defaultValue={exhibit?.colorA ?? "#157a7e"} />
          </label>
          <label className="field">
            <span>Colour B</span>
            <input name="colorB" type="color" defaultValue={exhibit?.colorB ?? "#c99635"} />
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          <Save size={18} />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
