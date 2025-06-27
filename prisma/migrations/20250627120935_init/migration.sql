-- CreateTable
CREATE TABLE "Subdomain" (
    "id" SERIAL NOT NULL,
    "subdomain" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subdomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subdomain_subdomain_key" ON "Subdomain"("subdomain");
