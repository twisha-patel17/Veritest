
const {
  aiTestCasesResponseSchema,
} = require("./src/validators/ai-testcase.validator");

const validResponse = {
  testCases: [
    {
      title: "Handles negative numbers",
      description: "Checks maximum value among negative numbers.",
      testCode: "assert.strictEqual(findMax([-5, -2, -9]), -2);",
      sourceFile: "math.js",
    },
  ],
};

const invalidResponse = {
  testCases: [
    {
      title: "",
      description: "Invalid test case",
      testCode: "",
      sourceFile: null,
    },
  ],
};

const unexpectedResponse = {
  ...validResponse,
  provider: "Gemini",
};

const testCases = [
  {
    name: "Valid response",
    data: validResponse,
    expected: true,
  },
  {
    name: "Invalid response",
    data: invalidResponse,
    expected: false,
  },
  {
    name: "Unexpected property",
    data: unexpectedResponse,
    expected: false,
  },
];

for (const test of testCases) {
  const result = aiTestCasesResponseSchema.safeParse(test.data);

  const passed = result.success === test.expected;

  console.log(
    `${passed ? "PASS" : "FAIL"}: ${test.name}`
  );

  if (!result.success && !passed) {
    console.log(result.error.issues);
  }
}
