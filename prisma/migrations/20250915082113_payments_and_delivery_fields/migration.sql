-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLACED',
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" DATETIME,
    "deliverySlot" TEXT,
    "method" TEXT NOT NULL DEFAULT 'DELIVERY',
    "subtotal" DECIMAL NOT NULL,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "notes" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "city" TEXT,
    "street" TEXT,
    "apt" TEXT,
    "deliveryNotes" TEXT,
    "deliveryFee" DECIMAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentExpiresAt" DATETIME,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("apt", "city", "code", "contactEmail", "contactName", "contactPhone", "deliveryDate", "deliveryNotes", "deliverySlot", "discount", "id", "method", "notes", "placedAt", "status", "street", "subtotal", "total", "userId") SELECT "apt", "city", "code", "contactEmail", "contactName", "contactPhone", "deliveryDate", "deliveryNotes", "deliverySlot", "discount", "id", "method", "notes", "placedAt", "status", "street", "subtotal", "total", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");
CREATE INDEX "Order_status_placedAt_idx" ON "Order"("status", "placedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
