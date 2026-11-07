
const { z } = require("zod");
const sourceFileService = require("../services/sourcefile.service");

// Validation schema for creating a source file.
const createSourceFileSchema = z.object({
  fileName: z.string().trim().min(1).max(255),

  filePath: z.string().trim().min(1).max(255),

  content: z.string().min(1).max(100000),

  language: z.enum([
    "javascript",
    "typescript",
    "python",
  ]),
}).strict();

// Create source file.
const createSourceFile = async (req, res, next) => {
  try {
    const validation = createSourceFileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid source file data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const sourceFile = await sourceFileService.createSourceFile(
      req.params.projectId,
      req.user.id,
      validation.data
    );

    if (!sourceFile) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Source file created successfully",
      sourceFile,
    });
  } catch (error) {
    next(error);
  }
};

// Get all source files.
const getSourceFiles = async (req, res, next) => {
  try {
    const sourceFiles = await sourceFileService.getSourceFiles(
      req.params.projectId,
      req.user.id
    );

    if (!sourceFiles) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: sourceFiles.length,
      sourceFiles,
    });
  } catch (error) {
    next(error);
  }
};

// Get one source file.
const getSourceFile = async (req, res, next) => {
  try {
    const sourceFile = await sourceFileService.getSourceFileById(
      req.params.projectId,
      req.user.id,
      req.params.fileId
    );

    if (!sourceFile) {
      return res.status(404).json({
        success: false,
        message: "Source file not found",
      });
    }

    return res.status(200).json({
      success: true,
      sourceFile,
    });
  } catch (error) {
    next(error);
  }
};

// Delete source file.
const deleteSourceFile = async (req, res, next) => {
  try {
    const sourceFile = await sourceFileService.deleteSourceFile(
      req.params.projectId,
      req.user.id,
      req.params.fileId
    );

    if (!sourceFile) {
      return res.status(404).json({
        success: false,
        message: "Source file not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Source file deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSourceFile,
  getSourceFiles,
  getSourceFile,
  deleteSourceFile,
};
