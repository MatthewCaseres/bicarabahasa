/*
  Warnings:

  - Made the column `englishAudioUrl` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indonesianAudioUrl` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "englishAudioUrl" SET NOT NULL,
ALTER COLUMN "indonesianAudioUrl" SET NOT NULL;
