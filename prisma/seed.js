const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const exhibits = [
  {
    displayOrder: 1,
    slug: "head-of-a-hound",
    title: "Head of a Hound",
    artist: "Pieter Boel",
    gallery: "Room 1",
    period: "c.1660-5",
    imageUrl: "Head of a Hound.jpg",
    description: "A close study of a hunting dog, painted with textured brushwork and startling immediacy."
  },
  {
    displayOrder: 2,
    slug: "a-young-man",
    title: "A Young Man",
    artist: "Piero di Cosimo",
    gallery: "Room 2",
    period: "c.1500",
    imageUrl: "A Young Man.jpg",
    description: "An early Renaissance portrait with a clear profile, distant gaze, and calm blue sky."
  },
  {
    displayOrder: 3,
    slug: "judith",
    title: "Judith",
    artist: "After Cristofano Allori",
    gallery: "Room 2",
    period: "17th Century",
    imageUrl: "Judith.jpg",
    description: "A dramatic small-scale retelling of Judith and Holofernes."
  },
  {
    displayOrder: 4,
    slug: "bucintoro-at-the-molo-on-ascension-day",
    title: "Bucintoro at the Molo on Ascension Day",
    artist: "Canaletto (Giovanni Antonio Canal)",
    gallery: "Room 2",
    period: "1760",
    imageUrl: "Bucintoro at the Molo on Ascension Day.jpg",
    description: "A ceremonial Venetian view filled with crowds, light, and the splendour of the Bucintoro."
  },
  {
    displayOrder: 5,
    slug: "saint-barbara-fleeing-from-her-father",
    title: "Saint Barbara fleeing from her Father",
    artist: "Sir Peter Paul Rubens",
    gallery: "Room 4",
    period: "c.1620",
    imageUrl: "Saint Barbara fleeing from her Father.jpg",
    description: "A swift oil sketch showing Saint Barbara escaping her father's violence."
  },
  {
    displayOrder: 6,
    slug: "girl-at-a-window",
    title: "Girl at a Window",
    artist: "Rembrandt van Rijn",
    gallery: "Room 5",
    period: "1645",
    imageUrl: "Girl at a Window.jpg",
    description: "A direct, intimate figure leaning forward from a painted window."
  },
  {
    displayOrder: 7,
    slug: "vase-with-flowers",
    title: "Vase with Flowers",
    artist: "Jan van Huysum",
    gallery: "Room 5",
    period: "c.1715",
    imageUrl: "Vase with Flowers.jpg",
    description: "A dark-ground still life with flowers emerging from dramatic contrasts of light."
  },
  {
    displayOrder: 8,
    slug: "elizabeth-and-mary-linley",
    title: "Elizabeth and Mary Linley",
    artist: "Thomas Gainsborough",
    gallery: "Room 10",
    period: "c.1772, retouched 1785",
    imageUrl: "Elizabeth and Mary Linley.jpg",
    description: "A double portrait of two musical sisters by one of Britain's great portraitists."
  },
  {
    displayOrder: 9,
    slug: "the-triumph-of-david",
    title: "The Triumph of David",
    artist: "Nicolas Poussin",
    gallery: "Room 11",
    period: "c.1631-3",
    imageUrl: "The Triumph of David.jpg",
    description: "A theatrical procession marking David's victory over Goliath."
  },
  {
    displayOrder: 10,
    slug: "jacob-with-laban-and-his-daughters",
    title: "Jacob with Laban and his Daughters",
    artist: "Claude",
    gallery: "Room 11",
    period: "1676",
    imageUrl: "Jacob with Laban and his Daughters.jpg",
    description: "A biblical story set within Claude's expansive, luminous landscape."
  },
  {
    displayOrder: 11,
    slug: "jacobs-dream",
    title: "Jacob's Dream",
    artist: "Arent de Gelder",
    gallery: "Room 12",
    period: "c.1715",
    imageUrl: "Jacob's Dream.jpg",
    description: "Jacob rests beneath a vision of angels ascending and descending."
  },
  {
    displayOrder: 12,
    slug: "joseph-receiving-pharaohs-ring",
    title: "Joseph receiving Pharaoh's Ring",
    artist: "Giambattista Tiepolo",
    gallery: "Room 12",
    period: "c.1733-5",
    imageUrl: "Joseph receiving Pharaoh's Ring.jpg",
    description: "Joseph receives Pharaoh's ring in a richly coloured Venetian biblical scene."
  }
];

async function main() {
  const slugs = exhibits.map((exhibit) => exhibit.slug);

  await prisma.exhibit.updateMany({
    where: {
      slug: {
        notIn: slugs
      }
    },
    data: {
      isActive: false
    }
  });

  for (const exhibit of exhibits) {
    await prisma.exhibit.upsert({
      where: { slug: exhibit.slug },
      update: {
        ...exhibit,
        symbol: "Art",
        colorA: "#2d2521",
        colorB: "#b99a63",
        isActive: true
      },
      create: {
        ...exhibit,
        symbol: "Art",
        colorA: "#2d2521",
        colorB: "#b99a63",
        isActive: true
      }
    });
  }

  await prisma.adminUser.upsert({
    where: { email: "curator@example.org" },
    update: {},
    create: {
      email: "curator@example.org",
      name: "Curator",
      role: "admin"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
