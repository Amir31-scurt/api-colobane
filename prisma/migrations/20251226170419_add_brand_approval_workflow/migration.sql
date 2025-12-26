-- CreateEnum
CREATE TYPE "BrandApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "approvalStatus" "BrandApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejectedReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" INTEGER,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "isActive" SET DEFAULT false;
