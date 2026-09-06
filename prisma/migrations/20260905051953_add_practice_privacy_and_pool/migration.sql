-- AlterTable
ALTER TABLE "Practice" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PoolEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoolEntry_userId_idx" ON "PoolEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolEntry_userId_practiceId_key" ON "PoolEntry"("userId", "practiceId");

-- AddForeignKey
ALTER TABLE "PoolEntry" ADD CONSTRAINT "PoolEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolEntry" ADD CONSTRAINT "PoolEntry_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
