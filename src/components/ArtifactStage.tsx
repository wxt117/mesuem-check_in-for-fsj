import Image from "next/image";
import type { Exhibit } from "@prisma/client";
import { artworkImages } from "@/lib/artwork-images";

type ArtifactStageProps = {
  exhibit: Pick<Exhibit, "slug" | "title" | "symbol" | "colorA" | "colorB">;
};

export function ArtifactStage({ exhibit }: ArtifactStageProps) {
  const image = artworkImages[exhibit.slug];

  if (image) {
    return (
      <div className="artifact-stage artwork-stage">
        <Image src={image} alt={exhibit.title} fill sizes="(max-width: 860px) 100vw, 44vw" priority />
      </div>
    );
  }

  return (
    <div
      className="artifact-stage"
      style={
        {
          "--artifact-a": exhibit.colorA,
          "--artifact-b": exhibit.colorB
        } as React.CSSProperties
      }
    >
      <div className="artifact" aria-hidden="true">
        {exhibit.symbol}
      </div>
    </div>
  );
}
