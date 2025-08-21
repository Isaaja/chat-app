-- AlterTable
ALTER TABLE "public"."Comment" ALTER COLUMN "uploads" DROP NOT NULL,
ALTER COLUMN "uploads" SET DATA TYPE TEXT;
