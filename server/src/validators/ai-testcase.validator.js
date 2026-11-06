
const { z } = require("zod");

// Schema for one AI-generated test case.
const aiTestCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(100),

  description: z
    .string()
    .trim()
    .max(500),

  testCode: z
    .string()
    .trim()
    .min(1),

  sourceFile: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .nullable(),
});

// Schema for the complete AI response.
const aiTestCasesResponseSchema = z.object({
  testCases: z
    .array(aiTestCaseSchema)
    .min(1)
    .max(20),
}).strict();

module.exports = {
  aiTestCaseSchema,
  aiTestCasesResponseSchema,
};
