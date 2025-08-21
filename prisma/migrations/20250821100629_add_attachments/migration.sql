/*
  Warnings:

  - You are about to drop the column `type` on the `Comment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AttachmentType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "public"."Comment" DROP COLUMN "type",
ALTER COLUMN "message" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" SERIAL NOT NULL,
    "type" "public"."AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
