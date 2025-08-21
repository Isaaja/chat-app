/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_commentId_fkey";

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "uploads" TEXT[];

-- DropTable
DROP TABLE "public"."Attachment";

-- DropEnum
DROP TYPE "public"."AttachmentType";
