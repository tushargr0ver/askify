/*
  Warnings:

  - You are about to drop the column `inputTokens` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `outputTokens` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokens` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `lastTokenReset` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyTokensUsed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tokenLimit` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokensUsed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `token_usage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."token_usage" DROP CONSTRAINT "token_usage_userId_fkey";

-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "inputTokens",
DROP COLUMN "outputTokens",
DROP COLUMN "totalTokens";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "lastTokenReset",
DROP COLUMN "monthlyTokensUsed",
DROP COLUMN "tokenLimit",
DROP COLUMN "totalTokensUsed",
ADD COLUMN     "dailyLimit" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "monthlyLimit" INTEGER NOT NULL DEFAULT 1000;

-- DropTable
DROP TABLE "public"."token_usage";

-- CreateTable
CREATE TABLE "public"."user_usage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_usage_userId_date_key" ON "public"."user_usage"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."user_usage" ADD CONSTRAINT "user_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
