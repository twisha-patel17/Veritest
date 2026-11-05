
const prisma = require("../config/prisma");
const { executeTestCase } = require("./test-runner.service");

const executeTestRun = async ({ testRunId, projectId, userId }) => {
  // 1. Verify TestRun ownership.
  const testRun = await prisma.testRun.findFirst({
    where: {
      id: testRunId,
      projectId,
      project: {
        userId,
      },
    },
  });

  if (!testRun) {
    throw new Error("Test run not found");
  }

  // 2. Fetch project test cases.
  const testCases = await prisma.testCase.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (testCases.length === 0) {
    throw new Error("No test cases found");
  }

  // 3. Acquire execution lock.
  const lock = await prisma.testRun.updateMany({
    where: {
      id: testRunId,
      projectId,
      status: "PENDING",
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      completedAt: null,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: null,
    },
  });

  if (lock.count === 0) {
    throw new Error(
      "This test run has already been executed or is currently running"
    );
  }

  try {
    // 4. Initialize TestRun statistics.
    await prisma.testRun.update({
      where: {
        id: testRunId,
      },
      data: {
        totalTests: testCases.length,
      },
    });

    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let errorTests = 0;
    let totalDuration = 0;

    // 5. Execute test cases sequentially.
    for (const testCase of testCases) {
      let result;

      try {
        result = await executeTestCase(testCase.testCode);
      } catch (error) {
        // Infrastructure or execution-provider error.
        result = {
          status: "ERROR",
          duration: null,
          exitCode: null,
          stdout: "",
          stderr: "",
          errorMessage: error.message || "Execution provider failed",
        };
      }

      // 6. Aggregate execution duration.
      if (typeof result.duration === "number") {
        totalDuration += result.duration;
      }

      // 7. Update execution counters.
      switch (result.status) {
        case "PASSED":
          passedTests++;
          break;

        case "FAILED":
          failedTests++;
          break;

        case "SKIPPED":
          skippedTests++;
          break;

        case "ERROR":
          errorTests++;
          break;

        default:
          throw new Error(
            `Unexpected test result status: ${result.status}`
          );
      }

      // 8. Save individual test result.
      await prisma.testResult.upsert({
        where: {
          testRunId_testCaseId: {
            testRunId,
            testCaseId: testCase.id,
          },
        },
        update: result,
        create: {
          testRunId,
          testCaseId: testCase.id,
          ...result,
        },
      });
    }

    // 9. Determine final TestRun status.
    const finalStatus =
      errorTests === testCases.length
        ? "FAILED"
        : "COMPLETED";

    // 10. Persist final statistics.
    const completedRun = await prisma.testRun.update({
      where: {
        id: testRunId,
      },
      data: {
        status: finalStatus,
        totalTests: testCases.length,
        passedTests,
        failedTests,
        skippedTests,
        duration: totalDuration,
        completedAt: new Date(),
      },
      include: {
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                origin: true,
                sourceFile: true,
              },
            },
          },
        },
      },
    });

    return {
      ...completedRun,
      errorTests,
    };
  } catch (error) {
    // 11. Mark orchestration failure.
    await prisma.testRun.update({
      where: {
        id: testRunId,
      },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });

    throw error;
  }
};

module.exports = {
  executeTestRun,
};
