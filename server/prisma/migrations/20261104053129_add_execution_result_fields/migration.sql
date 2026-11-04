-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "exitCode" INTEGER,
ADD COLUMN     "stderr" TEXT,
ADD COLUMN     "stdout" TEXT;
