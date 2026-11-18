
const prisma = require("../config/prisma");

/**
 * Mutation operators supported by the initial JavaScript engine.
 *
 * Each operator replaces one piece of source code with another.
 */
const MUTATION_OPERATORS = [
  {
    name: "ARITHMETIC",
    replacements: {
      "+": "-",
      "-": "+",
      "*": "/",
      "/": "*",
      "%": "*",
    },
  },
  {
    name: "RELATIONAL",
    replacements: {
      "<": "<=",
      "<=": "<",
      ">": ">=",
      ">=": ">",
      "===": "!==",
      "!==": "===",
      "==": "!=",
      "!=": "==",
    },
  },
  {
    name: "LOGICAL",
    replacements: {
      "&&": "||",
      "||": "&&",
    },
  },
  {
    name: "INCREMENT",
    replacements: {
      "++": "--",
      "--": "++",
    },
  },
];

/**
 * Finds mutation candidates while avoiding comments and string literals.
 * This is a lightweight first version, not a full JavaScript parser.
 */
const tokenizeSource = (sourceCode) => {
  const tokens = [];
  const pattern =
    /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|(?:===|!==|<=|>=|==|!=|&&|\|\||\+\+|--|[+\-*/%<>])/g;

  let match;

  while ((match = pattern.exec(sourceCode)) !== null) {
    const value = match[0];

    // Ignore comments and string/template literals.
    if (
      value.startsWith("//") ||
      value.startsWith("/*") ||
      value.startsWith('"') ||
      value.startsWith("'") ||
      value.startsWith("`")
    ) {
      continue;
    }

    tokens.push({
      value,
      start: match.index,
      end: match.index + value.length,
    });
  }

  return tokens;
};

/**
 * Generates mutant candidates from source code.
 * The original source string is never modified.
 */
const generateMutantsFromSource = (sourceCode) => {
  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    throw new Error("Source code must be a non-empty string.");
  }

  const tokens = tokenizeSource(sourceCode);
  const mutants = [];
  const seen = new Set();

  for (const token of tokens) {
    for (const operator of MUTATION_OPERATORS) {
      const replacement = operator.replacements[token.value];

      if (!replacement) {
        continue;
      }

      const mutatedCode =
        sourceCode.slice(0, token.start) +
        replacement +
        sourceCode.slice(token.end);

      if (seen.has(mutatedCode)) {
        continue;
      }

      seen.add(mutatedCode);

      const lineNumber =
        sourceCode.slice(0, token.start).split("\n").length;

      mutants.push({
        operator: operator.name,
        description: `Replace ${token.value} with ${replacement}`,
        lineNumber,
        originalCode: token.value,
        mutatedCode,
        status: "PENDING",
      });
    }
  }

  return mutants;
};

/**
 * Generates and stores mutants for a source file.
 */
const generateMutationRun = async ({
  projectId,
  sourceFileId,
  userId,
}) => {
  // Verify project ownership and source file association.
  const sourceFile = await prisma.sourceFile.findFirst({
    where: {
      id: sourceFileId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
    },
  });

  if (!sourceFile) {
    throw new Error("Source file not found in this project.");
  }

  if (
    !["javascript", "js"].includes(
      sourceFile.language.toLowerCase()
    )
  ) {
    throw new Error(
      "Mutation testing currently supports JavaScript files only."
    );
  }

  // Generate mutants in memory.
  const mutants = generateMutantsFromSource(sourceFile.content);

  if (mutants.length === 0) {
    throw new Error(
      "No supported mutation operators were found in this source file."
    );
  }

  // Store the mutation run and all its mutants.
  const mutationRun = await prisma.mutationRun.create({
    data: {
      projectId,
      sourceFileId,
      status: "PENDING",
      totalMutants: mutants.length,
      mutants: {
        create: mutants,
      },
    },
    include: {
      mutants: true,
    },
  });

  return mutationRun;
};

module.exports = {
  generateMutantsFromSource,
  generateMutationRun,
};
