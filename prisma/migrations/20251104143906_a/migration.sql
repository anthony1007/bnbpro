-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Deposit', 'Withdraw', 'Profit', 'Claim');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "sponsor" TEXT,
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceWei" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "walletAddress" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "package" INTEGER NOT NULL,
    "perday" DOUBLE PRECISION,
    "quarter" INTEGER,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundPurchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" TEXT NOT NULL,
    "package" INTEGER,
    "perday" DOUBLE PRECISION,
    "quarter" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastClaimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalClaimed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextClaimAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "maxClaimable" DOUBLE PRECISION,
    "txHash" TEXT,
    "remarks" TEXT,

    CONSTRAINT "FundPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSweepAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositAddress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'bsc',
    "derivationIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tokenSymbol" TEXT,
    "tokenAddress" TEXT,
    "txHash" TEXT,
    "from" TEXT,
    "to" TEXT,
    "status" "TxStatus" NOT NULL DEFAULT 'PENDING',
    "network" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "height" INTEGER,
    "width" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketReply" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER,
    "adminId" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "FundPurchase_userId_fundId_key" ON "FundPurchase"("userId", "fundId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_address_key" ON "UserWallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "UserWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DepositAddress_address_key" ON "DepositAddress"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitHistory" ADD CONSTRAINT "ProfitHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitHistory" ADD CONSTRAINT "ProfitHistory_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundPurchase" ADD CONSTRAINT "FundPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundPurchase" ADD CONSTRAINT "FundPurchase_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositAddress" ADD CONSTRAINT "DepositAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketReply" ADD CONSTRAINT "TicketReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
