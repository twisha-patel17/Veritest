
const prisma = require("../config/prisma");
const { executeCode } = require("./piston.service");

const executeTestRun = async ({ testRunId, projectId, userId }) => {
  // 1. Verify ownership of the TestRun.
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

  // 2. Prevent duplicate or concurrent execution.
  const lock = await prisma.testRun.updateMany({
    where: {
      id: testRunId,
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
    // 3. Fetch project test cases.
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

    // 4. Execute test cases sequentially.
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

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

        const duration =
          typeof run.wallTime === "number" ? run.wallTime : null;

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
        result = {
          status: "ERROR",
          duration: null,
          exitCode: null,
          stdout: "",
          stderr: "",
          errorMessage: error.message,
        };
      }

      // 5. Update the appropriate counter.
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

      // 6. Persist the individual result.
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

    // 7. Determine final TestRun status.
    const finalStatus =
      errorTests === testCases.length
        ? "FAILED"
        : "COMPLETED";

    // 8. Save final statistics.
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
    // 9. Mark orchestration failure.
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
