-- CreateTable
CREATE TABLE "public"."Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomParticipant" (
    "roomId" INTEGER NOT NULL,
    "participantId" TEXT NOT NULL,

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("roomId","participantId")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RoomParticipant" ADD CONSTRAINT "RoomParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
