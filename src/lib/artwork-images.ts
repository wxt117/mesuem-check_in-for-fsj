import type { StaticImageData } from "next/image";
import aYoungMan from "@/assets/arts/A Young Man.jpg";
import bucintoro from "@/assets/arts/Bucintoro at the Molo on Ascension Day.jpg";
import elizabethAndMaryLinley from "@/assets/arts/Elizabeth and Mary Linley.jpg";
import girlAtAWindow from "@/assets/arts/Girl at a Window.jpg";
import headOfAHound from "@/assets/arts/Head of a Hound.jpg";
import jacobWithLaban from "@/assets/arts/Jacob with Laban and his Daughters.jpg";
import jacobsDream from "@/assets/arts/Jacob's Dream.jpg";
import josephReceivingPharaohsRing from "@/assets/arts/Joseph receiving Pharaoh's Ring.jpg";
import judith from "@/assets/arts/Judith.jpg";
import saintBarbara from "@/assets/arts/Saint Barbara fleeing from her Father.jpg";
import theTriumphOfDavid from "@/assets/arts/The Triumph of David.jpg";
import vaseWithFlowers from "@/assets/arts/Vase with Flowers.jpg";

export const artworkImages: Record<string, StaticImageData> = {
  "head-of-a-hound": headOfAHound,
  "a-young-man": aYoungMan,
  judith,
  "bucintoro-at-the-molo-on-ascension-day": bucintoro,
  "saint-barbara-fleeing-from-her-father": saintBarbara,
  "girl-at-a-window": girlAtAWindow,
  "vase-with-flowers": vaseWithFlowers,
  "elizabeth-and-mary-linley": elizabethAndMaryLinley,
  "the-triumph-of-david": theTriumphOfDavid,
  "jacob-with-laban-and-his-daughters": jacobWithLaban,
  "jacobs-dream": jacobsDream,
  "joseph-receiving-pharaohs-ring": josephReceivingPharaohsRing
};
