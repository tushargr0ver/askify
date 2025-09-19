-- AlterTable
ALTER TABLE "public"."user_usage" ADD COLUMN     "repos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uploads" INTEGER NOT NULL DEFAULT 0;
