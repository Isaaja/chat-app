import { PrismaClient } from "@prisma/client";

// Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Fetching chat data from API...");

  const res = await fetch("https://bit.ly/chat_room_endpoint");
  const data = await res.json();

  for (const item of data.results) {
    const room = item.room;

    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: {
        id: room.id,
        name: room.name,
        imageUrl: room.image_url,
      },
    });

    for (const p of room.participant) {
      await prisma.participant.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          role: p.role,
        },
      });

      await prisma.roomParticipant.upsert({
        where: {
          roomId_participantId: {
            roomId: room.id,
            participantId: p.id,
          },
        },
        update: {},
        create: {
          roomId: room.id,
          participantId: p.id,
        },
      });
    }

    for (const c of item.comments) {
      await prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          type: c.type,
          message: c.message,
          senderId: c.sender,
          roomId: room.id,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully from API!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
