-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityOnHand" REAL NOT NULL DEFAULT 0,
    "avgCostPerUnit" REAL NOT NULL DEFAULT 0,
    "lowStockThreshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Ingredient" ("createdAt", "id", "lowStockThreshold", "name", "quantityOnHand", "unit") SELECT "createdAt", "id", "lowStockThreshold", "name", "quantityOnHand", "unit" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
