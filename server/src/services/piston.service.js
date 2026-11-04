const PISTON_URL = (
  process.env.PISTON_URL || "http://localhost:2000"
).replace(/\/+$/, "");

const EXECUTION_LIMITS = {
  maxSourceSize: 100 * 1024,
  maxStdinSize: 10 * 1024,
  maxRunTimeout: 3000,
  requestTimeout: 10000,
};

const executeCode = async ({
  sourceCode,
  language = "javascript",
  version = "20.11.1",
  stdin = "",
  args = [],
  runTimeout = 3000,
}) => {
  // Validate source code
  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    throw new Error("Source code is required");
  }

  if (Buffer.byteLength(sourceCode, "utf8") > EXECUTION_LIMITS.maxSourceSize) {
    throw new Error("Source code exceeds the 100 KB limit");
  }

  // Initially support JavaScript only
  if (language !== "javascript") {
    throw new Error("Only JavaScript execution is currently supported");
  }

  if (version !== "20.11.1") {
    throw new Error("Unsupported JavaScript runtime version");
  }

  if (typeof stdin !== "string") {
    throw new Error("stdin must be a string");
  }

  if (Buffer.byteLength(stdin, "utf8") > EXECUTION_LIMITS.maxStdinSize) {
    throw new Error("stdin exceeds the 10 KB limit");
  }

  if (
    !Array.isArray(args) ||
    args.length > 20 ||
    !args.every((arg) => typeof arg === "string" && arg.length <= 1000)
  ) {
    throw new Error("Invalid execution arguments");
  }

  if (
    !Number.isInteger(runTimeout) ||
    runTimeout < 100 ||
    runTimeout > EXECUTION_LIMITS.maxRunTimeout
  ) {
    throw new Error("Invalid execution timeout");
  }

  const payload = {
    language,
    version,
    files: [
      {
        name: "main.js",
        content: sourceCode,
      },
    ],
    stdin,
    args,
    run_timeout: runTimeout,
  };

  try {
    const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(EXECUTION_LIMITS.requestTimeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Piston execution failed (${response.status}): ${errorBody.slice(0, 1000)}`
      );
    }

    const result = await response.json();

    if (!result.run) {
      throw new Error("Invalid response received from Piston");
    }

    return {
      language: result.language,
      version: result.version,

      compile: result.compile
        ? {
            stdout: result.compile.stdout || "",
            stderr: result.compile.stderr || "",
            code: result.compile.code ?? null,
            signal: result.compile.signal ?? null,
          }
        : null,

      run: {
        stdout: result.run.stdout || "",
        stderr: result.run.stderr || "",
        code: result.run.code ?? null,
        signal: result.run.signal ?? null,
        memory: result.run.memory ?? null,
        cpuTime: result.run.cpu_time ?? null,
        wallTime: result.run.wall_time ?? null,
        message: result.run.message ?? null,
        status: result.run.status ?? null,
      },
    };
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("Execution provider request timed out");
    }

    throw error;
  }
};

module.exports = {
  executeCode,
};