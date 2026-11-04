
const prisma = require("../config/prisma");
const { executeCode } = require("./piston.service");

const executeTestRun = async ({ testRunId, projectId, userId }) => {
  // 1. Verify that this test run belongs to the user's project.
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

  if (testRun.status === "RUNNING") {
    throw new Error("This test run is already running");
  }

  // 2. Fetch all test cases belonging to the project.
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

  // 3. Mark the test run as running.
  await prisma.testRun.update({
    where: {
      id: testRunId,
    },
    data: {
      status: "RUNNING",
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      startedAt: new Date(),
      completedAt: null,
    },
  });

  let passedTests = 0;
  let failedTests = 0;
  let totalDuration = 0;

  try {
    // 4. Execute each test case sequentially.
    for (const testCase of testCases) {
      let result;

      try {
        const execution = await executeCode({
          sourceCode: testCase.testCode,
          language: "javascript",
          version: "20.11.1",
          runTimeout: 3000,
        });

        const run = execution.run;

        const passed = run.code === 0 && !run.signal;

        const duration = run.wallTime ?? null;

        if (duration !== null) {
          totalDuration += duration;
        }

        result = {
          status: passed ? "PASSED" : "FAILED",
          duration,
          exitCode: run.code,
          stdout: run.stdout,
          stderr: run.stderr,
          errorMessage: passed
            ? null
            : run.stderr || run.message || "Test execution failed",
        };
      } catch (error) {
        // Execution-provider errors are recorded separately.
        result = {
          status: "ERROR",
          duration: null,
          exitCode: null,
          stdout: "",
          stderr: "",
          errorMessage: error.message,
        };
      }

      // 5. Update counters.
      if (result.status === "PASSED") {
        passedTests++;
      } else {
        failedTests++;
      }

      // 6. Save the individual test result.
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

    // 7. Mark the entire test run as completed.
    const completedRun = await prisma.testRun.update({
      where: {
        id: testRunId,
      },
      data: {
        status: "COMPLETED",
        totalTests: testCases.length,
        passedTests,
        failedTests,
        skippedTests: 0,
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

    return completedRun;
  } catch (error) {
    // Mark the run as failed if the orchestration itself fails.
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
