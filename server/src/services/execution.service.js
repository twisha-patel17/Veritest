
const prisma = require("../config/prisma");
const { executeTestCase } = require("./test-runner.service");

const getFailureType = (result) => {
  const message = [
    result.errorMessage,
    result.stderr,
  ]
    .filter(Boolean)
    .join("\n");

  if (
    /AssertionError|Assertion failed|ERR_ASSERTION/i.test(message)
  ) {
    return "ASSERTION";
  }

  if (
    /timeout|timed out|ETIMEDOUT|deadline/i.test(message)
  ) {
    return "TIMEOUT";
  }

  return "RUNTIME";
};

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

  // 2. Fetch only approved test cases.
  const testCases = await prisma.testCase.findMany({
    where: {
      projectId,
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (testCases.length === 0) {
    throw new Error("No test cases found");
  }

  // 3. Fetch source files required by approved test cases.
  const filePaths = [
    ...new Set(
      testCases
        .map((testCase) => testCase.sourceFile)
        .filter(Boolean)
    ),
  ];

  const sourceFiles = await prisma.sourceFile.findMany({
    where: {
      projectId,
      filePath: {
        in: filePaths,
      },
    },
  });

  const sourceFileMap = new Map(
    sourceFiles.map((file) => [file.filePath, file.content])
  );

  // 4. Acquire execution lock atomically.
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
      totalTests: testCases.length,
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
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let errorTests = 0;
    let totalDuration = 0;

    // 5. Execute approved test cases sequentially.
    for (const testCase of testCases) {
      let result;

      try {
        const sourceCode = sourceFileMap.get(testCase.sourceFile);

        if (!sourceCode) {
          throw new Error(
            `Source file not found: ${
              testCase.sourceFile || "No source file specified"
            }`
          );
        }

        result = await executeTestCase({
          sourceCode,
          testCode: testCase.testCode,
        });

        const validStatuses = [
          "PASSED",
          "FAILED",
          "SKIPPED",
          "ERROR",
        ];

        if (
          !result ||
          !validStatuses.includes(result.status)
        ) {
          throw new Error(
            "Invalid result received from test runner"
          );
        }
      } catch (error) {
        result = {
          status: "ERROR",
          duration: null,
          exitCode: null,
          stdout: "",
          stderr: "",
          errorMessage:
            error.message || "Execution provider failed",
        };
      }

      // 6. Aggregate execution duration.
      if (
        typeof result.duration === "number" &&
        Number.isFinite(result.duration) &&
        result.duration >= 0
      ) {
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
      }

      // 8. Persist individual test result.
      const savedResult = await prisma.testResult.upsert({
        where: {
          testRunId_testCaseId: {
            testRunId,
            testCaseId: testCase.id,
          },
        },
        update: {
          status: result.status,
          duration: result.duration,
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          errorMessage: result.errorMessage,
        },
        create: {
          testRunId,
          testCaseId: testCase.id,
          status: result.status,
          duration: result.duration,
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          errorMessage: result.errorMessage,
        },
      });

      // 9. Automatically create a Failure record
      // only when the test actually fails.
      if (result.status === "FAILED") {
        const failureType = getFailureType(result);

        const failureMessage =
          result.errorMessage ||
          result.stderr ||
          "Test execution failed";

        await prisma.failure.upsert({
          where: {
            testResultId: savedResult.id,
          },
          update: {
            type: failureType,
            title: testCase.title,
            errorMessage: failureMessage,
            stackTrace: result.stderr || null,
            stdout: result.stdout || null,
            stderr: result.stderr || null,
            status: "UNCONFIRMED",
          },
          create: {
            testResultId: savedResult.id,
            type: failureType,
            title: testCase.title,
            errorMessage: failureMessage,
            stackTrace: result.stderr || null,
            stdout: result.stdout || null,
            stderr: result.stderr || null,
            status: "UNCONFIRMED",
          },
        });
      }
    }

    // 10. Mark TestRun as completed.
    const completedRun = await prisma.testRun.update({
      where: {
        id: testRunId,
      },
      data: {
        status: "COMPLETED",
        totalTests: testCases.length,
        passedTests,
        failedTests: failedTests + errorTests,
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
    try {
      await prisma.testRun.updateMany({
        where: {
          id: testRunId,
          projectId,
          status: "RUNNING",
        },
        data: {
          status: "FAILED",
          completedAt: new Date(),
        },
      });
    } catch (cleanupError) {
      console.error(
        "Failed to update TestRun after execution error:",
        cleanupError
      );
    }

    throw error;
  }
};

module.exports = {
  executeTestRun,
};
