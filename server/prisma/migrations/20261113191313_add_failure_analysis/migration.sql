-- CreateTable
CREATE TABLE "Failure" (
    "id" TEXT NOT NULL,
    "testResultId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "failingInput" TEXT,
    "expected" TEXT,
    "actual" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNCONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Failure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReproductionAttempt" (
    "id" TEXT NOT NULL,
    "failureId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReproductionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Failure_testResultId_key" ON "Failure"("testResultId");

-- CreateIndex
CREATE INDEX "Failure_status_idx" ON "Failure"("status");

-- CreateIndex
CREATE INDEX "Failure_createdAt_idx" ON "Failure"("createdAt");

-- CreateIndex
CREATE INDEX "ReproductionAttempt_failureId_idx" ON "ReproductionAttempt"("failureId");

-- CreateIndex
CREATE UNIQUE INDEX "ReproductionAttempt_failureId_attemptNumber_key" ON "ReproductionAttempt"("failureId", "attemptNumber");

-- AddForeignKey
ALTER TABLE "Failure" ADD CONSTRAINT "Failure_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "TestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductionAttempt" ADD CONSTRAINT "ReproductionAttempt_failureId_fkey" FOREIGN KEY ("failureId") REFERENCES "Failure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
