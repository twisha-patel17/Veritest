-- CreateTable
CREATE TABLE "MutationRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceFileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalMutants" INTEGER NOT NULL DEFAULT 0,
    "killedMutants" INTEGER NOT NULL DEFAULT 0,
    "survivedMutants" INTEGER NOT NULL DEFAULT 0,
    "equivalentMutants" INTEGER NOT NULL DEFAULT 0,
    "inconclusiveMutants" INTEGER NOT NULL DEFAULT 0,
    "mutationScore" DOUBLE PRECISION,
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mutant" (
    "id" TEXT NOT NULL,
    "mutationRunId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "originalCode" TEXT NOT NULL,
    "mutatedCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "killedByTestCaseId" TEXT,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mutant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MutationRun_projectId_createdAt_idx" ON "MutationRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "MutationRun_sourceFileId_idx" ON "MutationRun"("sourceFileId");

-- CreateIndex
CREATE INDEX "MutationRun_status_idx" ON "MutationRun"("status");

-- CreateIndex
CREATE INDEX "Mutant_mutationRunId_idx" ON "Mutant"("mutationRunId");

-- CreateIndex
CREATE INDEX "Mutant_status_idx" ON "Mutant"("status");

-- CreateIndex
CREATE INDEX "Mutant_killedByTestCaseId_idx" ON "Mutant"("killedByTestCaseId");

-- AddForeignKey
ALTER TABLE "MutationRun" ADD CONSTRAINT "MutationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutationRun" ADD CONSTRAINT "MutationRun_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "SourceFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mutant" ADD CONSTRAINT "Mutant_mutationRunId_fkey" FOREIGN KEY ("mutationRunId") REFERENCES "MutationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mutant" ADD CONSTRAINT "Mutant_killedByTestCaseId_fkey" FOREIGN KEY ("killedByTestCaseId") REFERENCES "TestCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
