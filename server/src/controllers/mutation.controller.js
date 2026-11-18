
const mutationGeneratorService = require("../services/mutation-generator.service");
const mutationExecutionService = require("../services/mutation-execution.service");

// Generate mutants for a source file
const createMutationRun = async (req, res, next) => {
  try {
    const { sourceFileId } = req.body;

    if (!sourceFileId) {
      return res.status(400).json({
        success: false,
        message: "Source file ID is required",
      });
    }

    const mutationRun = await mutationGeneratorService.generateMutationRun({
      projectId: req.params.projectId,
      sourceFileId,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Mutation run created successfully",
      mutationRun,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("does not belong")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("Only JavaScript") ||
      error.message.includes("not supported")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

// Execute a mutation run
const executeMutationRun = async (req, res, next) => {
  try {
    const mutationRun = await mutationExecutionService.executeMutationRun({
      mutationRunId: req.params.mutationRunId,
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Mutation run executed successfully",
      mutationRun,
    });
  } catch (error) {
    if (error.message === "Mutation run not found") {
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
  createMutationRun,
  executeMutationRun,
};
