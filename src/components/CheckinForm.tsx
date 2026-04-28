import Link from "next/link";
import { Save, Sparkles } from "lucide-react";

const emojiOptions = [
  { emoji: "\u{1f604}", label: "Happy" },
  { emoji: "\u{1f622}", label: "Sad" },
  { emoji: "\u{1f60c}", label: "Calm" },
  { emoji: "\u{1f914}", label: "Curious" },
  { emoji: "\u{1f979}", label: "Moved" },
  { emoji: "\u{1f60e}", label: "Inspired" },
  { emoji: "\u{1f628}", label: "Uneasy" },
  { emoji: "\u{1f635}", label: "Confused" }
];

type CheckinFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  initialEmoji?: string;
  initialComment?: string | null;
  status?: string;
};

export function CheckinForm({ action, initialEmoji = "\u{1f604}", initialComment = "", status }: CheckinFormProps) {
  const initialOption = emojiOptions.some((option) => option.emoji === initialEmoji) ? initialEmoji : "\u{1f604}";

  return (
    <form className="checkin-panel" action={action}>
      <h2>Your reaction</h2>
      <div className="emoji-picker" role="radiogroup" aria-label="Choose an Emoji">
        {emojiOptions.map((option) => (
          <label className="emoji-option" key={option.emoji}>
            <input
              type="radio"
              name="emoji"
              value={option.emoji}
              defaultChecked={option.emoji === initialOption}
            />
            <span className="emoji-choice">
              <span className="emoji-glyph">{option.emoji}</span>
              <span className="emoji-label">{option.label}</span>
            </span>
          </label>
        ))}
      </div>
      <label className="field">
        <span>Comment</span>
        <textarea
          name="comment"
          maxLength={280}
          defaultValue={initialComment ?? ""}
          placeholder="Write what this object made you notice, feel, or wonder about."
        />
      </label>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          <Save size={18} />
          Save check-in
        </button>
        <Link className="secondary-button" href="/summary">
          <Sparkles size={18} />
          View summary
        </Link>
      </div>
      <p className="status-message">{status}</p>
    </form>
  );
}
