
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

  // 3. Fetch source files required by the approved test cases.
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

  // Create a lookup map: file path -> source code.
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
        // Find the source code associated with this test case.
        const sourceCode = sourceFileMap.get(testCase.sourceFile);

        if (!sourceCode) {
          throw new Error(
            `Source file not found: ${
              testCase.sourceFile || "No source file specified"
            }`
          );
        }

        // Execute source code together with its test code.
        result = await executeTestCase({
          sourceCode,
          testCode: testCase.testCode,
        });

        // 6. Validate test runner output.
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
        // 7. Handle provider or runner failures.
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

      // 8. Aggregate execution duration.
      if (
        typeof result.duration === "number" &&
        Number.isFinite(result.duration) &&
        result.duration >= 0
      ) {
        totalDuration += result.duration;
      }

      // 9. Update execution counters.
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

      // 10. Persist individual test result.
      await prisma.testResult.upsert({
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
    }

    // 11. Mark the TestRun as completed.
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
    // 12. Mark orchestration failure.
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
