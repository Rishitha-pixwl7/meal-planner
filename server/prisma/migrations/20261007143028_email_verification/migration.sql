-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cuisine" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifyAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verifyCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verifyCodeHash" TEXT,
ADD COLUMN     "verifyCodeSentAt" TIMESTAMP(3);
