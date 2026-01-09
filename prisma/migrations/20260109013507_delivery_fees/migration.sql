-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "locationId" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryLocationId" INTEGER;

-- CreateTable
CREATE TABLE "ReferenceLocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Dakar',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deliveryZoneId" INTEGER,

    CONSTRAINT "ReferenceLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReferenceLocation" ADD CONSTRAINT "ReferenceLocation_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ReferenceLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryLocationId_fkey" FOREIGN KEY ("deliveryLocationId") REFERENCES "ReferenceLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
