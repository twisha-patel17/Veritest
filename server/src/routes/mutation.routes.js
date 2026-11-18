
const express = require("express");

const {
  createMutationRun,
  executeMutationRun,
} = require("../controllers/mutation.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all mutation testing routes
router.use(authMiddleware);

// Generate mutants for a source file
router.post(
  "/projects/:projectId/mutation-runs",
  createMutationRun
);

// Execute a mutation run
router.post(
  "/projects/:projectId/mutation-runs/:mutationRunId/execute",
  executeMutationRun
);

module.exports = router;
