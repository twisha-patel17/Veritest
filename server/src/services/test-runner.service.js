
const { executeCode } = require("./piston.service");

const ASSERTION_MARKER = "__VERITEST_ASSERTIONS_PASSED__";

const executeTestCase = async (testCode) => {
  // 1. Validate test code.
  if (typeof testCode !== "string" || !testCode.trim()) {
    throw new Error("Test code is required");
  }

  // 2. Wrap test code with assertion tracking.
  const wrappedCode = `
const vm = require("node:vm");
const originalAssert = require("node:assert/strict");

let assertionCount = 0;

const trackedAssert = new Proxy(originalAssert, {
  apply(target, thisArg, argumentsList) {
    assertionCount++;
    return Reflect.apply(target, thisArg, argumentsList);
  },

  get(target, property) {
    const value = Reflect.get(target, property, target);

    if (typeof value !== "function") {
      return value;
    }

    return function (...args) {
      assertionCount++;
      return Reflect.apply(value, target, args);
    };
  }
});

const customRequire = (moduleName) => {
  if (
    moduleName === "node:assert/strict" ||
    moduleName === "assert/strict" ||
    moduleName === "node:assert" ||
    moduleName === "assert"
  ) {
    return trackedAssert;
  }

  throw new Error("Module not allowed: " + moduleName);
};

const sandboxProcess = {
  exitCode: 0,
};

const sandbox = {
  require: customRequire,
  console,
  process: sandboxProcess,
};

const userCode = JSON.parse(${JSON.stringify(JSON.stringify(testCode))});

(async () => {
  let executionFailed = false;

  try {
    await vm.runInNewContext(
      "(async () => { " + userCode + " })()",
      sandbox,
      { timeout: 3000 }
    );
  } catch (error) {
    executionFailed = true;
    console.error(error.stack || error);
  }

  if (executionFailed || sandboxProcess.exitCode !== 0) {
    process.exitCode = 1;
  } else if (assertionCount === 0) {
    console.error("VERITEST_NO_ASSERTIONS");
    process.exitCode = 1;
  } else {
    console.log("${ASSERTION_MARKER}");
  }
})();
`;

  try {
    // 3. Execute wrapped code through Piston.
    const execution = await executeCode({
      sourceCode: wrappedCode,
      language: "javascript",
      version: "20.11.1",
      runTimeout: 3000,
    });

    // 4. Validate execution response.
    if (!execution || !execution.run) {
      throw new Error("Invalid execution response");
    }

    const run = execution.run;

    // 5. Handle compilation errors.
    if (
      execution.compile &&
      (
        execution.compile.code !== 0 ||
        execution.compile.signal
      )
    ) {
      return {
        status: "FAILED",
        duration: null,
        exitCode: execution.compile.code,
        stdout: execution.compile.stdout,
        stderr: execution.compile.stderr,
        errorMessage:
          execution.compile.stderr ||
          "Test compilation failed",
      };
    }

    // 6. Detect assertion marker.
    const hasAssertions =
      run.stdout.includes(ASSERTION_MARKER);

    // 7. Determine test outcome.
    const passed =
      run.code === 0 &&
      !run.signal &&
      hasAssertions;

    // 8. Return normalized result.
    return {
      status: passed ? "PASSED" : "FAILED",

      duration:
        typeof run.wallTime === "number"
          ? Math.round(run.wallTime)
          : null,

      exitCode: run.code,

      stdout: run.stdout
        .replace(ASSERTION_MARKER, "")
        .trim(),

      stderr: run.stderr,

      errorMessage: passed
        ? null
        : run.stderr ||
          run.message ||
          (
            !hasAssertions
              ? "Test did not execute any assertions"
              : "Test execution failed"
          ),
    };
  } catch (error) {
    // 9. Provider failures are handled by execution.service.js.
    throw error;
  }
};

module.exports = {
  executeTestCase,
};
