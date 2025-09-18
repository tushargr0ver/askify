-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "model" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "preferredModel" TEXT DEFAULT 'gpt-4o-mini';
