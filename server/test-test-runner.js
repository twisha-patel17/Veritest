const { executeTestCase } = require("./src/services/test-runner.service");

async function main() {
  const testCases = [
    {
      name: "Passing assertion",
      code: `
        const assert = require("node:assert/strict");
        assert.equal(2 + 2, 4);
      `,
    },
    {
      name: "Failing assertion",
      code: `
        const assert = require("node:assert/strict");
        assert.equal(2 + 2, 5);
      `,
    },
    {
      name: "Missing assertion",
      code: `
        const result = 2 + 2;
        console.log(result);
      `,
    },
    {
      name: "Runtime error",
      code: `
        throw new Error("Intentional runtime error");
      `,
    },
    {
      name: "Multiple assertions",
      code: `
        const assert = require("node:assert/strict");
        assert.equal(10 + 5, 15);
        assert.deepEqual([1, 2], [1, 2]);
        assert.ok(true);
      `,
    },
    {
      name: "Async assertion",
      code: `
        const assert = require("node:assert/strict");

        async function test() {
          await Promise.resolve();
          assert.equal(5 * 5, 25);
        }

        await test();
      `,
    },
  ];

  for (const testCase of testCases) {
    console.log("\\n------------------------------");
    console.log(testCase.name);
    console.log("------------------------------");

    try {
      const result = await executeTestCase(testCase.code);
      console.log(result);
    } catch (error) {
      console.error("Runner error:", error.message);
    }
  }
}

main();