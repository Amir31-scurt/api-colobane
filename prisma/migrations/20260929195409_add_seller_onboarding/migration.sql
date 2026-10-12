-- CreateTable
CREATE TABLE "SellerOnboarding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ownerName" TEXT,
    "brandName" TEXT,
    "activity" TEXT,
    "categorySlug" TEXT,
    "location" TEXT,
    "contactPhone" TEXT,
    "logoUrl" TEXT,
    "productName" TEXT,
    "productPrice" DOUBLE PRECISION,
    "productStock" INTEGER,
    "productImageUrl" TEXT,
    "brandId" INTEGER,
    "firstProductId" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "chatMessages" JSONB NOT NULL DEFAULT '[]',
    "coachMarkBoutiqueShown" BOOLEAN NOT NULL DEFAULT false,
    "coachMarkProductsShown" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerOnboarding_userId_key" ON "SellerOnboarding"("userId");

-- AddForeignKey
ALTER TABLE "SellerOnboarding" ADD CONSTRAINT "SellerOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
