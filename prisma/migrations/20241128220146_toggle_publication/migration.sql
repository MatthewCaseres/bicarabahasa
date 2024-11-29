-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
