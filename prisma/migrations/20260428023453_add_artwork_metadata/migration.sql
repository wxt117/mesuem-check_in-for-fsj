-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exhibit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "gallery" TEXT NOT NULL,
    "period" TEXT,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "symbol" TEXT NOT NULL DEFAULT 'Art',
    "colorA" TEXT NOT NULL DEFAULT '#157a7e',
    "colorB" TEXT NOT NULL DEFAULT '#c99635',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Exhibit" ("colorA", "colorB", "createdAt", "description", "gallery", "id", "imageUrl", "isActive", "period", "slug", "symbol", "title", "updatedAt") SELECT "colorA", "colorB", "createdAt", "description", "gallery", "id", "imageUrl", "isActive", "period", "slug", "symbol", "title", "updatedAt" FROM "Exhibit";
DROP TABLE "Exhibit";
ALTER TABLE "new_Exhibit" RENAME TO "Exhibit";
CREATE UNIQUE INDEX "Exhibit_slug_key" ON "Exhibit"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
