
const { z } = require("zod");

const aiTestCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  testCode: z
    .string()
    .trim()
    .min(1)
    .max(10000),
}).strict();

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
