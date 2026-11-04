
const { z } = require("zod");
const testcaseService = require("../services/testcase.service");

// Validation schema for creating a test case
const createTestCaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),

  description: z.string().trim().max(500).optional(),

  testCode: z.string().min(1, "Test code is required"),

  sourceFile: z.string().trim().max(255).optional(),

  origin: z.string().trim().max(20).optional(),
});

// Validation schema for updating a test case
const updateTestCaseSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),

  description: z.string().trim().max(500).nullable().optional(),

  testCode: z.string().min(1).optional(),

  sourceFile: z.string().trim().max(255).nullable().optional(),

  origin: z.string().trim().max(20).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

// Create test case
const createTestCase = async (req, res, next) => {
  try {
    const validation = createTestCaseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid test case data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const testCase = await testcaseService.createTestCase(
      req.params.projectId,
      req.user.id,
      validation.data
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Test case created successfully",
      testCase,
    });
  } catch (error) {
    next(error);
  }
};

// Get all test cases for a project
const getProjectTestCases = async (req, res, next) => {
  try {
    const testCases = await testcaseService.getProjectTestCases(
      req.params.projectId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: testCases.length,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

// Get single test case
const getTestCase = async (req, res, next) => {
  try {
    const testCase = await testcaseService.getTestCaseById(
      req.params.testCaseId,
      req.params.projectId,
      req.user.id
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    return res.status(200).json({
      success: true,
      testCase,
    });
  } catch (error) {
    next(error);
  }
};

// Update test case
const updateTestCase = async (req, res, next) => {
  try {
    const validation = updateTestCaseSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid test case data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const testCase = await testcaseService.updateTestCase(
      req.params.testCaseId,
      req.params.projectId,
      req.user.id,
      validation.data
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test case updated successfully",
      testCase,
    });
  } catch (error) {
    next(error);
  }
};

// Delete test case
const deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await testcaseService.deleteTestCase(
      req.params.testCaseId,
      req.params.projectId,
      req.user.id
    );

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test case deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTestCase,
  getProjectTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
};
