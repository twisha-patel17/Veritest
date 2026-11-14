
const failureService = require("../services/failure.service");

// Get all failures for a project.
const getProjectFailures = async (req, res, next) => {
  try {
    const failures = await failureService.getProjectFailures(
      req.params.projectId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: failures.length,
      failures,
    });
  } catch (error) {
    next(error);
  }
};

// Get one failure with complete details.
const getFailure = async (req, res, next) => {
  try {
    const failure = await failureService.getFailureById(
      req.params.failureId,
      req.params.projectId,
      req.user.id
    );

    if (!failure) {
      return res.status(404).json({
        success: false,
        message: "Failure not found",
      });
    }

    return res.status(200).json({
      success: true,
      failure,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectFailures,
  getFailure,
};
