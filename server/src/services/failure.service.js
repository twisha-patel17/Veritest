
const prisma = require("../config/prisma");

// Get all failures belonging to a project.
const getProjectFailures = async (projectId, userId) => {
  return prisma.failure.findMany({
    where: {
      testResult: {
        testRun: {
          projectId,
          project: {
            userId,
          },
        },
      },
    },
    include: {
      testResult: {
        include: {
          testCase: {
            select: {
              id: true,
              title: true,
              description: true,
              sourceFile: true,
              origin: true,
              testCode: true,
            },
          },
          testRun: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              completedAt: true,
            },
          },
        },
      },
      reproductionAttempts: {
        orderBy: {
          attemptNumber: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get one failure by ID.
const getFailureById = async (failureId, projectId, userId) => {
  return prisma.failure.findFirst({
    where: {
      id: failureId,
      testResult: {
        testRun: {
          projectId,
          project: {
            userId,
          },
        },
      },
    },
    include: {
      testResult: {
        include: {
          testCase: true,
          testRun: true,
        },
      },
      reproductionAttempts: {
        orderBy: {
          attemptNumber: "desc",
        },
      },
    },
  });
};

module.exports = {
  getProjectFailures,
  getFailureById,
};
