-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subdomainCount" INTEGER NOT NULL DEFAULT 0;
