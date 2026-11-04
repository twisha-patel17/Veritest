
const prisma = require("../config/prisma");

const createTestRun = async (projectId, userId) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    return null;
  }

  // Count test cases before creating a run
  const totalTests = await prisma.testCase.count({
    where: {
      projectId,
    },
  });

  // Do not create an empty test run
  if (totalTests === 0) {
    return { error: "NO_TEST_CASES" };
  }

  // Create the test run
  return prisma.testRun.create({
    data: {
      projectId,
      status: "PENDING",
      totalTests,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

// Get all test runs belonging to a project
const getProjectTestRuns = async (projectId, userId) => {
  return prisma.testRun.findMany({
    where: {
      projectId,
      project: {
        userId,
      },
    },
    include: {
      _count: {
        select: {
          results: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get a specific test run with its results
const getTestRunById = async (testRunId, projectId, userId) => {
  return prisma.testRun.findFirst({
    where: {
      id: testRunId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      results: {
        include: {
          testCase: {
            select: {
              id: true,
              title: true,
              sourceFile: true,
              origin: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

module.exports = {
  createTestRun,
  getProjectTestRuns,
  getTestRunById,
};
