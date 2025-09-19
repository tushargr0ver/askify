-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "outputTokens" INTEGER,
ADD COLUMN     "totalTokens" INTEGER;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastTokenReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyTokensUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenLimit" INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN     "totalTokensUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."token_usage" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."token_usage" ADD CONSTRAINT "token_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
