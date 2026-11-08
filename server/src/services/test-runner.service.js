
const { executeCode } = require("./piston.service");

const ASSERTION_MARKER = "__VERITEST_ASSERTIONS_PASSED__";

const executeTestCase = async ({ sourceCode, testCode }) => {
  // 1. Validate source code.
  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    throw new Error("Source code is required");
  }

  // 2. Validate test code.
  if (typeof testCode !== "string" || !testCode.trim()) {
    throw new Error("Test code is required");
  }

  // 3. Build the execution program.
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

// Only allow the assertion module.
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

// Create a CommonJS module environment.
const userModule = {
  exports: {},
};

const sandboxProcess = {
  exitCode: 0,
};

const sandbox = {
  require: customRequire,
  console,
  process: sandboxProcess,
  module: userModule,
  exports: userModule.exports,
};

// Safely embed the submitted code as strings.
const userSourceCode = JSON.parse(
  ${JSON.stringify(JSON.stringify(sourceCode))}
);

const userTestCode = JSON.parse(
  ${JSON.stringify(JSON.stringify(testCode))}
);

(async () => {
  let executionFailed = false;

  try {
    // 4. Execute the user's source file.
    vm.runInNewContext(
      userSourceCode,
      sandbox,
      { timeout: 3000 }
    );

    // 5. Expose exported functions to the test code.
    const exportedFunctions = userModule.exports;

    if (
      !exportedFunctions ||
      typeof exportedFunctions !== "object"
    ) {
      throw new Error(
        "Source file must export its functions using module.exports"
      );
    }

    Object.assign(sandbox, exportedFunctions);

    // 6. Execute the test code in the same sandbox.
    await vm.runInNewContext(
      "(async () => { " + userTestCode + " })()",
      sandbox,
      { timeout: 3000 }
    );
  } catch (error) {
    executionFailed = true;
    console.error(error.stack || error);
  }

  // 7. Determine the final execution result.
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

  // 8. Send the wrapped program to Piston.
  const execution = await executeCode({
    sourceCode: wrappedCode,
    language: "javascript",
    version: "20.11.1",
    runTimeout: 3000,
  });

  if (!execution || !execution.run) {
    throw new Error("Invalid execution response");
  }

  const run = execution.run;

  // 9. Handle compilation failures.
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
      stdout: execution.compile.stdout || "",
      stderr: execution.compile.stderr || "",
      errorMessage:
        execution.compile.stderr ||
        "Test compilation failed",
    };
  }

  // 10. Check whether assertions passed.
  const hasAssertions =
    (run.stdout || "").includes(ASSERTION_MARKER);

  const passed =
    run.code === 0 &&
    !run.signal &&
    hasAssertions;

  return {
    status: passed ? "PASSED" : "FAILED",
    duration:
      typeof run.wallTime === "number"
        ? Math.round(run.wallTime)
        : null,
    exitCode: run.code,
    stdout: (run.stdout || "")
      .replace(ASSERTION_MARKER, "")
      .trim(),
    stderr: run.stderr || "",
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
};

module.exports = {
  executeTestCase,
};
