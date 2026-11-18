
const prisma = require("../config/prisma");
const { executeTestCase } = require("./test-runner.service");

/**
 * A returned FAILED result with an exit code represents an actual
 * execution failure of the submitted program.
 *
 * A thrown error or missing exit code is treated as inconclusive,
 * because it may represent an execution-provider problem.
 */
const classifyMutationResult = (result) => {
  if (!result || result.status === "ERROR") {
    return "INCONCLUSIVE";
  }

  if (result.status === "PASSED") {
    return "SURVIVED";
  }

  if (
    result.status === "FAILED" &&
    Number.isInteger(result.exitCode)
  ) {
    return "KILLED";
  }

  return "INCONCLUSIVE";
};

const executeMutationRun = async ({
  mutationRunId,
  projectId,
  userId,
}) => {
  // 1. Verify mutation run ownership.
  const mutationRun = await prisma.mutationRun.findFirst({
    where: {
      id: mutationRunId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      sourceFile: true,
      mutants: true,
    },
  });

  if (!mutationRun) {
    throw new Error("Mutation run not found");
  }

  if (mutationRun.mutants.length === 0) {
    throw new Error("No mutants found in this mutation run");
  }

  // 2. Fetch approved tests associated with this source file.
  const testCases = await prisma.testCase.findMany({
    where: {
      projectId,
      sourceFile: mutationRun.sourceFile.filePath,
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (testCases.length === 0) {
    throw new Error(
      "No approved test cases found for this source file"
    );
  }

  // 3. Acquire an execution lock.
  const lock = await prisma.mutationRun.updateMany({
    where: {
      id: mutationRunId,
      projectId,
      status: "PENDING",
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      completedAt: null,
      duration: null,
    },
  });

  if (lock.count === 0) {
    throw new Error(
      "This mutation run has already been executed or is currently running"
    );
  }

  const startedAt = Date.now();

  try {
    // 4. Baseline: test the original source first.
    const baselinePassingTests = [];

    for (const testCase of testCases) {
      try {
        const result = await executeTestCase({
          sourceCode: mutationRun.sourceFile.content,
          testCode: testCase.testCode,
        });

        if (result.status === "PASSED") {
          baselinePassingTests.push(testCase);
        }
      } catch (error) {
        // Provider errors cannot establish a reliable baseline.
        console.error(
          `Baseline execution failed for ${testCase.title}:`,
          error.message
        );
      }
    }

    let killedMutants = 0;
    let survivedMutants = 0;
    let equivalentMutants = 0;
    let inconclusiveMutants = 0;

    // 5. Without a passing baseline, no mutant can be evaluated.
    if (baselinePassingTests.length === 0) {
      for (const mutant of mutationRun.mutants) {
        await prisma.mutant.update({
          where: {
            id: mutant.id,
          },
          data: {
            status: "INCONCLUSIVE",
            errorMessage:
              "No approved test cases passed against the original source.",
          },
        });

        inconclusiveMutants++;
      }
    } else {
      // 6. Execute each mutant against baseline-passing tests.
      for (const mutant of mutationRun.mutants) {
        let mutantStatus = "SURVIVED";
        let killedByTestCaseId = null;
        let errorMessage = null;
        let stdout = null;
        let stderr = null;
        let mutantDuration = 0;

        for (const testCase of baselinePassingTests) {
          let result;

          try {
            result = await executeTestCase({
              // Use the mutated source in memory.
              // Never update SourceFile.content.
              sourceCode: mutant.mutatedCode,
              testCode: testCase.testCode,
            });
          } catch (error) {
            mutantStatus = "INCONCLUSIVE";
            errorMessage =
              error.message || "Execution provider failed";
            break;
          }

          if (
            typeof result.duration === "number" &&
            Number.isFinite(result.duration) &&
            result.duration >= 0
          ) {
            mutantDuration += result.duration;
          }

          const classification =
            classifyMutationResult(result);

          if (classification === "KILLED") {
            mutantStatus = "KILLED";
            killedByTestCaseId = testCase.id;
            errorMessage =
              result.errorMessage || "Test detected the mutation";
            stdout = result.stdout || null;
            stderr = result.stderr || null;
            break;
          }

          if (classification === "INCONCLUSIVE") {
            mutantStatus = "INCONCLUSIVE";
            errorMessage =
              result.errorMessage ||
              result.stderr ||
              "Mutation execution was inconclusive";
            stdout = result.stdout || null;
            stderr = result.stderr || null;
            break;
          }
        }

        // 7. Persist each mutant's result.
        await prisma.mutant.update({
          where: {
            id: mutant.id,
          },
          data: {
            status: mutantStatus,
            killedByTestCaseId,
            duration: mutantDuration,
            errorMessage,
            stdout,
            stderr,
          },
        });

        switch (mutantStatus) {
          case "KILLED":
            killedMutants++;
            break;

          case "SURVIVED":
            survivedMutants++;
            break;

          case "EQUIVALENT":
            equivalentMutants++;
            break;

          case "INCONCLUSIVE":
            inconclusiveMutants++;
            break;
        }
      }
    }

    // 8. Calculate mutation score.
    // Equivalent and inconclusive mutants are excluded.
    const evaluableMutants =
      killedMutants + survivedMutants;

    const mutationScore =
      evaluableMutants > 0
        ? Number(
            (
              (killedMutants / evaluableMutants) *
              100
            ).toFixed(2)
          )
        : null;

    // 9. Complete the mutation run.
    const completedRun = await prisma.mutationRun.update({
      where: {
        id: mutationRunId,
      },
      data: {
        status: "COMPLETED",
        totalMutants: mutationRun.mutants.length,
        killedMutants,
        survivedMutants,
        equivalentMutants,
        inconclusiveMutants,
        mutationScore,
        duration: Date.now() - startedAt,
        completedAt: new Date(),
      },
      include: {
        sourceFile: true,
        mutants: {
          include: {
            killedByTestCase: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return {
      ...completedRun,
      baselineTotalTests: testCases.length,
      baselinePassingTests: baselinePassingTests.length,
    };
  } catch (error) {
    // 10. Mark orchestration failure.
    await prisma.mutationRun.updateMany({
      where: {
        id: mutationRunId,
        projectId,
        status: "RUNNING",
      },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        duration: Date.now() - startedAt,
      },
    });

    throw error;
  }
};

module.exports = {
  executeMutationRun,
  classifyMutationResult,
};
