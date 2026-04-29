"use client";

import { Download, Share2 } from "lucide-react";
import { useState } from "react";

type ShareObject = {
  emoji: string;
  title: string;
};

type SummaryShareButtonProps = {
  content: string;
  mood: string;
  keywords: string[];
  objects?: ShareObject[];
};

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      line = testLine;
      continue;
    }

    if (line) {
      lines.push(line);
    }
    line = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  if (lines.length === maxLines && words.length) {
    const last = lines[maxLines - 1];
    if (words.join(" ").length > lines.join(" ").length) {
      lines[maxLines - 1] = `${last.replace(/[.,;:!?]?$/, "")}...`;
    }
  }

  return lines;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const lines = wrapLines(context, text, maxWidth, maxLines);
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not create share image."));
      }
    }, "image/png");
  });
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "the-emoji-archive.png";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function createShareImage({ content, mood, keywords, objects }: SummaryShareButtonProps) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.fillStyle = "#fbf8f1";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#157a7e";
  context.fillRect(0, 0, canvas.width, 18);
  context.fillStyle = "#c99635";
  context.fillRect(0, 18, canvas.width, 10);

  context.fillStyle = "#17181c";
  context.font = '700 64px "Times New Roman", Times, serif';
  context.fillText("THE EMOJI ARCHIVE", 80, 135);

  context.font = '700 38px "Times New Roman", Times, serif';
  context.fillStyle = "#157a7e";
  context.fillText("Your Emotional Museum Journey", 80, 198);

  context.font = '32px "Times New Roman", Times, serif';
  context.fillStyle = "#303139";
  let y = drawWrappedText(context, content, 80, 285, 920, 48, 10);

  y += 44;
  context.fillStyle = "#fffdfa";
  context.strokeStyle = "#ded9cf";
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(80, y, 920, 180, 18);
  context.fill();
  context.stroke();

  context.fillStyle = "#17181c";
  context.font = '700 34px "Times New Roman", Times, serif';
  context.fillText("Mood", 120, y + 58);
  context.font = '30px "Times New Roman", Times, serif';
  context.fillStyle = "#62646f";
  drawWrappedText(context, mood, 120, y + 104, 360, 38, 2);

  context.fillStyle = "#17181c";
  context.font = '700 34px "Times New Roman", Times, serif';
  context.fillText("Keywords", 560, y + 58);
  context.font = '28px "Times New Roman", Times, serif';
  context.fillStyle = "#62646f";
  drawWrappedText(context, keywords.slice(0, 5).join(", ") || "personal response", 560, y + 104, 360, 36, 2);

  return canvasToBlob(canvas);
}

export function SummaryShareButton(props: SummaryShareButtonProps) {
  const [status, setStatus] = useState("");

  async function share() {
    setStatus("");
    try {
      const blob = await createShareImage(props);
      const file = new File([blob], "the-emoji-archive.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "THE EMOJI ARCHIVE",
          text: "Your Emotional Museum Journey",
          files: [file]
        });
        setStatus("Share image ready.");
        return;
      }

      downloadBlob(blob);
      setStatus("Image downloaded.");
    } catch {
      setStatus("Could not create the share image.");
    }
  }

  async function download() {
    setStatus("");
    try {
      const blob = await createShareImage(props);
      downloadBlob(blob);
      setStatus("Image downloaded.");
    } catch {
      setStatus("Could not create the share image.");
    }
  }

  return (
    <div className="share-actions">
      <button className="primary-button" type="button" onClick={share}>
        <Share2 size={18} />
        Share to Instagram
      </button>
      <button className="secondary-button" type="button" onClick={download}>
        <Download size={18} />
        Download image
      </button>
      {status ? <p className="status-message">{status}</p> : null}
    </div>
  );
}
