
const testrunService = require("../services/testrun.service");
const executionService = require("../services/execution.service");

// Create a test run
const createTestRun = async (req, res, next) => {
  try {
    const testRun = await testrunService.createTestRun(
      req.params.projectId,
      req.user.id
    );

    if (!testRun) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (testRun.error === "NO_TEST_CASES") {
      return res.status(400).json({
        success: false,
        message: "Cannot create a test run without test cases",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Test run created successfully",
      testRun,
    });
  } catch (error) {
    next(error);
  }
};

// Get all test runs for a project
const getProjectTestRuns = async (req, res, next) => {
  try {
    const testRuns = await testrunService.getProjectTestRuns(
      req.params.projectId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: testRuns.length,
      testRuns,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single test run with results
const getTestRun = async (req, res, next) => {
  try {
    const testRun = await testrunService.getTestRunById(
      req.params.testRunId,
      req.params.projectId,
      req.user.id
    );

    if (!testRun) {
      return res.status(404).json({
        success: false,
        message: "Test run not found",
      });
    }

    return res.status(200).json({
      success: true,
      testRun,
    });
  } catch (error) {
    next(error);
  }
};

// Execute a test run
const executeTestRun = async (req, res, next) => {
  try {
    const testRun = await executionService.executeTestRun({
      testRunId: req.params.testRunId,
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Test run executed successfully",
      testRun,
    });
  } catch (error) {
    if (error.message === "Test run not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("already been executed") ||
      error.message.includes("currently running")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

module.exports = {
  createTestRun,
  getProjectTestRuns,
  getTestRun,
  executeTestRun,
};
