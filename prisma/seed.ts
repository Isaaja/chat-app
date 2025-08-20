import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Fetching chat data from API...");

  const res = await fetch("https://bit.ly/chat_room_endpoint");
  const data = await res.json();

  for (const item of data.results) {
    const room = await prisma.room.create({
      data: {
        name: item.room.name,
        imageUrl: item.room.image_url,
      },
    });

    for (const p of item.room.participant) {
      const participantId = p.id;

      await prisma.participant.upsert({
        where: { id: participantId },
        update: {},
        create: {
          id: participantId,
          name: p.name,
          role: p.role,
        },
      });

      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          participantId: participantId,
        },
      });
    }

    for (const c of item.comments) {
      await prisma.comment.create({
        data: {
          type: c.type,
          message: c.message,
          senderId: c.sender,
          roomId: room.id,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully with nanoid!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
