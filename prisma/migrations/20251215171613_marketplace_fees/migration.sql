-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "FeeTarget" AS ENUM ('ORDER', 'PRODUCT', 'SELLER', 'PAYMENT_PROVIDER');

-- CreateTable
CREATE TABLE "MarketplaceFee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "target" "FeeTarget" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeRecord" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "feeId" INTEGER,
    "name" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "target" "FeeTarget" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "appliedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FeeRecord" ADD CONSTRAINT "FeeRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeRecord" ADD CONSTRAINT "FeeRecord_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "MarketplaceFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
