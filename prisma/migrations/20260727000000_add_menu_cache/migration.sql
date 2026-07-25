-- CreateTable
CREATE TABLE "MenuCache" (
    "id" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "dishes" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuCache_restaurantName_location_key" ON "MenuCache"("restaurantName", "location");
