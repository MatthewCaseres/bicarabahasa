/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Deck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "imageUrl";
