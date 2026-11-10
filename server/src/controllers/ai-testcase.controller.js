
const { z } = require("zod");
const aiTestCaseService = require("../services/ai-testcase.service");

const generateTestCasesSchema = z.object({
  sourceFileId: z.string().trim().min(1, "Source file ID is required"),
}).strict();

const generateTestCases = async (req, res, next) => {
  try {
    // 1. Validate request body.
    const validation = generateTestCasesSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid generation request",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    // 2. Generate test cases.
    const testCases = await aiTestCaseService.generateTestCases(
      req.params.projectId,
      req.user.id,
      validation.data.sourceFileId
    );

    // 3. Handle missing or unauthorized source files.
    if (!testCases) {
      return res.status(404).json({
        success: false,
        message: "Source file not found",
      });
    }

    // 4. Return generated test cases.
    return res.status(201).json({
      success: true,
      message: "AI test cases generated successfully",
      count: testCases.length,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTestCases,
};
