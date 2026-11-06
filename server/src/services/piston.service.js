
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
  // 1. Validate source code.
  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    throw new Error("Source code is required");
  }

  if (
    Buffer.byteLength(sourceCode, "utf8") >
    EXECUTION_LIMITS.maxSourceSize
  ) {
    throw new Error("Source code exceeds the 100 KB limit");
  }

  // 2. Validate language and runtime.
  if (language !== "javascript") {
    throw new Error(
      "Only JavaScript execution is currently supported"
    );
  }

  if (version !== "20.11.1") {
    throw new Error("Unsupported JavaScript runtime version");
  }

  // 3. Validate stdin.
  if (typeof stdin !== "string") {
    throw new Error("stdin must be a string");
  }

  if (
    Buffer.byteLength(stdin, "utf8") >
    EXECUTION_LIMITS.maxStdinSize
  ) {
    throw new Error("stdin exceeds the 10 KB limit");
  }

  // 4. Validate arguments.
  if (
    !Array.isArray(args) ||
    args.length > 20 ||
    !args.every(
      (arg) => typeof arg === "string" && arg.length <= 1000
    )
  ) {
    throw new Error("Invalid execution arguments");
  }

  // 5. Validate execution timeout.
  if (
    !Number.isInteger(runTimeout) ||
    runTimeout < 100 ||
    runTimeout > EXECUTION_LIMITS.maxRunTimeout
  ) {
    throw new Error("Invalid execution timeout");
  }

  // 6. Prepare Piston payload.
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
    // 7. Execute code through Piston.
    const response = await fetch(
      `${PISTON_URL}/api/v2/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(
          EXECUTION_LIMITS.requestTimeout
        ),
      }
    );

    // 8. Handle HTTP errors.
    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Piston execution failed (${response.status}): ${errorBody.slice(
          0,
          1000
        )}`
      );
    }

    // 9. Parse provider response.
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "Piston returned an invalid JSON response"
      );
    }

    // 10. Validate response structure.
    if (
      !result ||
      typeof result !== "object" ||
      !result.run ||
      typeof result.run !== "object"
    ) {
      throw new Error(
        "Invalid response received from Piston"
      );
    }

    const run = result.run;

    if (
      typeof run.stdout !== "string" ||
      typeof run.stderr !== "string" ||
      !(
        run.code === null ||
        Number.isInteger(run.code)
      )
    ) {
      throw new Error(
        "Piston returned an incomplete execution result"
      );
    }

    // 11. Validate compilation result when present.
    let compile = null;

    if (result.compile !== undefined && result.compile !== null) {
      if (
        typeof result.compile !== "object" ||
        typeof result.compile.stdout !== "string" ||
        typeof result.compile.stderr !== "string"
      ) {
        throw new Error(
          "Piston returned an invalid compilation result"
        );
      }

      compile = {
        stdout: result.compile.stdout,
        stderr: result.compile.stderr,
        code: result.compile.code ?? null,
        signal: result.compile.signal ?? null,
      };
    }

    // 12. Return normalized execution result.
    return {
      language: result.language ?? language,
      version: result.version ?? version,

      compile,

      run: {
        stdout: run.stdout,
        stderr: run.stderr,
        code: run.code,
        signal: run.signal ?? null,
        memory: run.memory ?? null,
        cpuTime: run.cpu_time ?? null,
        wallTime: run.wall_time ?? null,
        message: run.message ?? null,
        status: run.status ?? null,
      },
    };
  } catch (error) {
    // 13. Normalize provider timeout errors.
    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      throw new Error(
        "Execution provider request timed out"
      );
    }

    throw error;
  }
};

module.exports = {
  executeCode,
};
