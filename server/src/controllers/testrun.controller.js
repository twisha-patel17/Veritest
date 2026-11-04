
const { z } = require("zod");
const testrunService = require("../services/testrun.service");


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

module.exports = {
  createTestRun,
  getProjectTestRuns,
  getTestRun,
};
