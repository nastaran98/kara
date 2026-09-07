-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quote_sourceId_key" ON "Quote"("sourceId");
