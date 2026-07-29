-- CreateEnum
CREATE TYPE "ProviderValidationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingMode" AS ENUM ('SELF_SIGNUP', 'FIELD_AGENT');

-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "onboardedByAgentName" TEXT,
ADD COLUMN     "onboardingMode" "OnboardingMode" NOT NULL DEFAULT 'SELF_SIGNUP',
ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "validationStatus" "ProviderValidationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ServiceSearchLog" (
    "id" SERIAL NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "selectedZoneId" INTEGER,
    "selectedCategoryId" INTEGER,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceLeadLog" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "sourcePage" TEXT,
    "userId" INTEGER,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceLeadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceFeedbackLog" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceFeedbackLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceSearchLog_searchQuery_idx" ON "ServiceSearchLog"("searchQuery");

-- CreateIndex
CREATE INDEX "ServiceSearchLog_timestamp_idx" ON "ServiceSearchLog"("timestamp");

-- CreateIndex
CREATE INDEX "ServiceSearchLog_resultsCount_idx" ON "ServiceSearchLog"("resultsCount");

-- CreateIndex
CREATE INDEX "ServiceLeadLog_providerId_timestamp_idx" ON "ServiceLeadLog"("providerId", "timestamp");

-- CreateIndex
CREATE INDEX "ServiceFeedbackLog_providerId_idx" ON "ServiceFeedbackLog"("providerId");

-- AddForeignKey
ALTER TABLE "ServiceLeadLog" ADD CONSTRAINT "ServiceLeadLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFeedbackLog" ADD CONSTRAINT "ServiceFeedbackLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
