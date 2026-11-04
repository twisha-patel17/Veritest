
const prisma = require("../config/prisma");

// Create a test case
const createTestCase = async (projectId, userId, data) => {
  // Verify that the project belongs to the logged-in user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    return null;
  }

  return prisma.testCase.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      testCode: data.testCode,
      sourceFile: data.sourceFile,
      origin: data.origin || "AI",
    },
  });
};

// Get all test cases belonging to a project
const getProjectTestCases = async (projectId, userId) => {
  return prisma.testCase.findMany({
    where: {
      projectId,
      project: {
        userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get a single test case
const getTestCaseById = async (testCaseId, projectId, userId) => {
  return prisma.testCase.findFirst({
    where: {
      id: testCaseId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      results: true,
    },
  });
};

// Update a test case
const updateTestCase = async (
  testCaseId,
  projectId,
  userId,
  data
) => {
  const existingTestCase = await getTestCaseById(
    testCaseId,
    projectId,
    userId
  );

  if (!existingTestCase) {
    return null;
  }

  return prisma.testCase.update({
    where: {
      id: testCaseId,
    },
    data,
  });
};

// Delete a test case
const deleteTestCase = async (testCaseId, projectId, userId) => {
  const existingTestCase = await getTestCaseById(
    testCaseId,
    projectId,
    userId
  );

  if (!existingTestCase) {
    return null;
  }

  return prisma.testCase.delete({
    where: {
      id: testCaseId,
    },
  });
};

module.exports = {
  createTestCase,
  getProjectTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
};
