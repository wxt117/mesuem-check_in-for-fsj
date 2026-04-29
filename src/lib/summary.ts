import { createHash } from "crypto";
import type { Checkin, Exhibit } from "@prisma/client";

export type CheckinWithExhibit = Checkin & {
  exhibit: Exhibit;
};

export type SummaryResult = {
  content: string;
  keywords: string[];
  mood: string;
  model: string;
  sourceHash: string;
};

const SUMMARY_PROMPT_VERSION = "emotional-journey-v2";

const moodCopy: Record<string, string> = {
  "\u{1f604}": "happy and open",
  "\u{1f622}": "sad and touched",
  "\u{1f60c}": "calm and attentive",
  "\u{1f914}": "curious and questioning",
  "\u{1f979}": "moved and tender",
  "\u{1f60e}": "inspired and energised",
  "\u{1f628}": "uneasy and alert",
  "\u{1f635}": "confused and overwhelmed"
};

function envValue(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function sourceHashForCheckins(checkins: CheckinWithExhibit[]) {
  const payload = [SUMMARY_PROMPT_VERSION]
    .concat(checkins.map((item) => `${item.exhibitId}:${item.emoji}:${item.comment ?? ""}:${item.updatedAt.toISOString()}`))
    .join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export function buildLocalSummary(checkins: CheckinWithExhibit[]): SummaryResult {
  const sourceHash = sourceHashForCheckins(checkins);
  if (!checkins.length) {
    return {
      content: "No check-ins yet. Scan an exhibit QR code to start building a visit summary.",
      keywords: [],
      mood: "not enough data",
      model: "local-fallback",
      sourceHash
    };
  }

  const counts = checkins.reduce<Record<string, number>>((acc, item) => {
    acc[item.emoji] = (acc[item.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const favoriteEmoji = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "\u{1f604}";
  const rooms = [...new Set(checkins.map((item) => item.exhibit.gallery))];
  const titles = checkins.map((item) => item.exhibit.title);
  const artists = [...new Set(checkins.map((item) => item.exhibit.artist).filter(Boolean))] as string[];
  const comments = checkins.map((item) => item.comment?.trim()).filter(Boolean) as string[];
  const longestComment = [...comments].sort((a, b) => b.length - a.length)[0];
  const keywords = [
    ...new Set([
      ...rooms,
      ...artists.slice(0, 2),
      favoriteEmoji,
      comments.length ? "personal response" : "emoji-led"
    ])
  ].slice(0, 6);

  const content = [
    `Your path through ${rooms.join(", ")} leans toward a ${moodCopy[favoriteEmoji] ?? "mixed"} way of looking.`,
    `${favoriteEmoji} appears as the strongest signal, turning the archive into a record of attention rather than a checklist.`,
    `The works holding the centre of this journey include ${titles.slice(0, 3).join(", ")}.`,
    longestComment
      ? `Your note "${longestComment}" gives the feeling a sharper edge.`
      : "Next time, notice whether your first emoji changes after you spend a little longer with the painting."
  ].join(" ");

  return {
    content,
    keywords,
    mood: moodCopy[favoriteEmoji] ?? "mixed",
    model: "local-fallback",
    sourceHash
  };
}

function summaryPrompt(checkins: CheckinWithExhibit[]) {
  return JSON.stringify(
    checkins.map((item) => ({
      exhibitTitle: item.exhibit.title,
      artist: item.exhibit.artist,
      room: item.exhibit.gallery,
      period: item.exhibit.period,
      emoji: item.emoji,
      comment: item.comment
    }))
  );
}

function parseSummaryJson(text: string, fallback: SummaryResult, model: string): SummaryResult {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as Partial<SummaryResult>;
    return {
      content: parsed.content || fallback.content,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 8) : fallback.keywords,
      mood: parsed.mood || fallback.mood,
      model,
      sourceHash: fallback.sourceHash
    };
  } catch {
    return {
      ...fallback,
      content: text || fallback.content,
      model
    };
  }
}

async function buildDeepSeekSummary(checkins: CheckinWithExhibit[], fallback: SummaryResult): Promise<SummaryResult> {
  const OpenAI = (await import("openai")).default;
  const model = envValue("DEEPSEEK_MODEL") || "deepseek-v4-flash";
  const client = new OpenAI({
    apiKey: envValue("DEEPSEEK_API_KEY"),
    baseURL: envValue("DEEPSEEK_BASE_URL") || "https://api.deepseek.com"
  });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You write "Your Emotional Museum Journey" for a visitor to a UK museum. Use only the provided painting responses. Do not invent facts. Avoid generic recap phrases such as "you checked in", "this visit includes", or "the works that shaped this visit". Interpret the emotional pattern: what the emojis and notes suggest about how the visitor looked, what they were drawn toward, and where there is tension or surprise. Mention 2-3 specific works. Write in warm second person, 100-130 words, with one guiding final sentence that helps the visitor keep looking. Return JSON with this shape: {"content":"visitor-facing report","keywords":["keyword"],"mood":"short mood phrase"}.'
      },
      {
        role: "user",
        content: summaryPrompt(checkins)
      }
    ]
  });

  return parseSummaryJson(response.choices[0]?.message?.content || "", fallback, model);
}

async function buildOpenAiSummary(checkins: CheckinWithExhibit[], fallback: SummaryResult): Promise<SummaryResult> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: envValue("OPENAI_API_KEY") });
  const model = envValue("OPENAI_MODEL") || "gpt-4.1-mini";

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          'You write "Your Emotional Museum Journey" for a museum visitor. Use only the provided exhibit responses. Do not invent facts. Interpret the emotional pattern instead of listing actions. Mention specific works, write in warm second person, and end with one guiding sentence for continued looking. Return valid JSON with content, keywords, and mood.'
      },
      {
        role: "user",
        content: summaryPrompt(checkins)
      }
    ]
  });

  return parseSummaryJson(response.output_text, fallback, model);
}

export async function buildAiSummary(checkins: CheckinWithExhibit[]): Promise<SummaryResult> {
  const fallback = buildLocalSummary(checkins);

  if (envValue("DEEPSEEK_API_KEY")) {
    return buildDeepSeekSummary(checkins, fallback);
  }

  if (envValue("OPENAI_API_KEY")) {
    return buildOpenAiSummary(checkins, fallback);
  }

  return fallback;
}
