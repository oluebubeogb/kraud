-- CreateEnum
CREATE TYPE "CommerceMode" AS ENUM ('INVEST', 'BUY', 'BOTH');

-- CreateEnum
CREATE TYPE "Horizon" AS ENUM ('SHORT_6M', 'LONG_12_18M');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PayKind" ADD VALUE 'INVEST';
ALTER TYPE "PayKind" ADD VALUE 'VAULT_TOPUP';
ALTER TYPE "PayKind" ADD VALUE 'WALLET_TOPUP';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "walletBalance" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "amountRaised" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "commerceMode" "CommerceMode" NOT NULL DEFAULT 'BOTH',
ADD COLUMN     "completionCost" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "diligenceFee" BIGINT,
ADD COLUMN     "estimatedProfit" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "horizon" "Horizon" NOT NULL DEFAULT 'LONG_12_18M',
ADD COLUMN     "insuranceFee" BIGINT,
ADD COLUMN     "maintenanceCost" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "minProfitMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "raiseDeadline" TIMESTAMP(3),
ADD COLUMN     "raiseStatus" TEXT NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "seatsNeeded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seatsTaken" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalNeeded" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "unitPrice" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "units" INTEGER,
ADD COLUMN     "vaultId" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'GOAL',
ALTER COLUMN "goalId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InvestmentUnit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "paymentRef" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "invested" BIGINT NOT NULL,
    "fees" BIGINT NOT NULL DEFAULT 0,
    "expectedProfit" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "maturesAt" TIMESTAMP(3) NOT NULL,
    "payout" BIGINT,
    "paidOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitSale" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "earned" BIGINT NOT NULL,
    "forfeit" BIGINT NOT NULL,
    "refund" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsVault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lockMonths" INTEGER NOT NULL,
    "ratePct" DOUBLE PRECISION NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "interest" BIGINT NOT NULL DEFAULT 0,
    "accruedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsVault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTx" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "kind" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "reward" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentUnit_paymentRef_key" ON "InvestmentUnit"("paymentRef");

-- CreateIndex
CREATE INDEX "InvestmentUnit_userId_idx" ON "InvestmentUnit"("userId");

-- CreateIndex
CREATE INDEX "InvestmentUnit_listingId_idx" ON "InvestmentUnit"("listingId");

-- CreateIndex
CREATE INDEX "SavingsVault_userId_idx" ON "SavingsVault"("userId");

-- CreateIndex
CREATE INDEX "WalletTx_userId_idx" ON "WalletTx"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeId_key" ON "Referral"("refereeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "InvestmentUnit" ADD CONSTRAINT "InvestmentUnit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentUnit" ADD CONSTRAINT "InvestmentUnit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitSale" ADD CONSTRAINT "UnitSale_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "InvestmentUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitSale" ADD CONSTRAINT "UnitSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsVault" ADD CONSTRAINT "SavingsVault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTx" ADD CONSTRAINT "WalletTx_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Retire escrow: legacy held funds are treated as settled.
UPDATE "Payment" SET "status" = 'PAID' WHERE "status" = 'HELD';
