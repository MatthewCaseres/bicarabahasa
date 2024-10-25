-- CreateTable
CREATE TABLE "LanguagePairing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nativeLanguage" TEXT NOT NULL,
    "foreignLanguage" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LanguagePairing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "languagePairingId" TEXT NOT NULL,
    CONSTRAINT "Collection_languagePairingId_fkey" FOREIGN KEY ("languagePairingId") REFERENCES "LanguagePairing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    CONSTRAINT "Deck_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nativeText" TEXT NOT NULL,
    "foreignText" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LanguagePairing_userId_idx" ON "LanguagePairing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguagePairing_userId_nativeLanguage_foreignLanguage_key" ON "LanguagePairing"("userId", "nativeLanguage", "foreignLanguage");

-- CreateIndex
CREATE INDEX "Collection_languagePairingId_idx" ON "Collection"("languagePairingId");

-- CreateIndex
CREATE INDEX "Deck_collectionId_idx" ON "Deck"("collectionId");

-- CreateIndex
CREATE INDEX "Card_deckId_idx" ON "Card"("deckId");
