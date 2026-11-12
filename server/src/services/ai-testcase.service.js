
const genAI = require("../config/gemini");
const sourceFileService = require("./sourcefile.service");
const testcaseService = require("./testcase.service");

const {
  aiTestCasesResponseSchema,
} = require("../validators/ai-testcase.validator");

// Generate test cases for a source file.
const generateTestCases = async (projectId, userId, sourceFileId) => {
  // 1. Retrieve the source file and verify ownership.
  const sourceFile = await sourceFileService.getSourceFileById(
    projectId,
    userId,
    sourceFileId
  );

  if (!sourceFile) {
    return null;
  }

  // 2. Build the prompt for Gemini.
  const prompt = `
You are an experienced software test engineer.

Analyze the following source code and generate meaningful test cases.

SOURCE FILE: ${sourceFile.fileName}

SOURCE LANGUAGE: ${sourceFile.language}

SOURCE CODE:
\`\`\`
${sourceFile.content}
\`\`\`

REQUIREMENTS:
1. Understand the functions and their expected behavior.
2. Generate tests for normal inputs, boundary conditions, and edge cases.
3. Use Node.js built-in assert module for JavaScript tests.
4. Do not invent functions, parameters, or behavior.
5. Do not modify the original source code.
6. Each testCode must contain executable test code.
7. Generate at most 5 distinct test cases.
8. Avoid duplicate test scenarios.
9. Return only valid JSON matching this structure:

{
  "testCases": [
    {
      "title": "Short descriptive title",
      "description": "What this test verifies",
      "testCode": "Executable test code"
    }
  ]
}
10. Keep each test case concise. Avoid unnecessary explanations and comments.
`;

  // 3. Send the prompt to Gemini.
  let response;

  try {
    console.log("Sending request to Gemini...");

    response = await genAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      },
    });

    console.log("Gemini response received successfully.");
  } catch (error) {
    console.error("Gemini generation error:", error);

    if (error.status === 504) {
      throw new Error(
        "Gemini took too long to respond. Please try again."
      );
    }

    throw new Error(
      error.message || "Gemini test generation failed."
    );
  }

  const generatedText = response.text;

  // 4. Check whether Gemini returned any content.
  if (!generatedText) {
    throw new Error("Gemini returned an empty response");
  }

  // 5. Parse the JSON response.
  let parsedResponse;

  try {
    parsedResponse = JSON.parse(generatedText);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON");
  }

  // 6. Validate the parsed response using Zod.
  const validation = aiTestCasesResponseSchema.safeParse(
    parsedResponse
  );

  if (!validation.success) {
    console.error("Gemini validation errors:", validation.error);

    throw new Error(
      "Gemini returned an invalid test case structure"
    );
  }

  // 7. Save generated test cases in the database.
  const savedTestCases = await Promise.all(
    validation.data.testCases.map((testCase) =>
      testcaseService.createTestCase(projectId, userId, {
        title: testCase.title,
        description: testCase.description,
        testCode: testCase.testCode,
        sourceFile: sourceFile.fileName,
        origin: "AI",
      })
    )
  );

  return savedTestCases;
};

module.exports = {
  generateTestCases,
};
