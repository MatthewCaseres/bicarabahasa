-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "englishHelpText" TEXT,
ADD COLUMN     "indonesianHelpText" TEXT;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "description" TEXT;
