import Image from "next/image";
import Link from "next/link";
import type { Checkin, Exhibit } from "@prisma/client";
import { artworkImages } from "@/lib/artwork-images";

type ExhibitCardProps = {
  exhibit: Exhibit;
  checkin?: Checkin | null;
};

export function ExhibitCard({ exhibit, checkin }: ExhibitCardProps) {
  const image = artworkImages[exhibit.slug];

  return (
    <Link
      className={`exhibit-card painting-card ${checkin ? "is-visited" : ""}`}
      href={`/e/${exhibit.slug}`}
      style={
        {
          "--artifact-a": exhibit.colorA,
          "--artifact-b": exhibit.colorB
        } as React.CSSProperties
      }
    >
      <div className="painting-thumb">
        {image ? (
          <Image src={image} alt={exhibit.title} fill sizes="(max-width: 700px) 100vw, (max-width: 980px) 33vw, 25vw" />
        ) : (
          <span aria-hidden="true">{exhibit.symbol}</span>
        )}
      </div>
      <div className="painting-caption">
        <h3>{exhibit.title}</h3>
        <p>{exhibit.artist}</p>
        <p>({exhibit.gallery})</p>
      </div>
    </Link>
  );
}
