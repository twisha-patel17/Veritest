
const { executeCode } = require("./piston.service");

const ASSERTION_MARKER = "__VERITEST_ASSERTIONS_PASSED__";

const executeTestCase = async (testCode) => {
  if (typeof testCode !== "string" || !testCode.trim()) {
    throw new Error("Test code is required");
  }

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

  const execution = await executeCode({
    sourceCode: wrappedCode,
    language: "javascript",
    version: "20.11.1",
    runTimeout: 3000,
  });

  const run = execution.run;
  const hasAssertions = run.stdout.includes(ASSERTION_MARKER);

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
    stdout: run.stdout.replace(ASSERTION_MARKER, "").trim(),
    stderr: run.stderr,
    errorMessage: passed
      ? null
      : run.stderr || run.message || "Test execution failed",
  };
};

module.exports = {
  executeTestCase,
};
