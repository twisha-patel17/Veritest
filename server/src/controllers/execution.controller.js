
const { executeTestRun } = require("../services/execution.service");

const executeTestRunController = async (req, res, next) => {
  try {
    const { projectId, testRunId } = req.params;
    const userId = req.user.id;

    const result = await executeTestRun({
      testRunId,
      projectId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Test run executed successfully.",
      data: result,
    });
  } catch (error) {
    if (error.message === "Test run not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "This test run is already running") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "No test cases found") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

module.exports = {
  executeTestRunController,
};
