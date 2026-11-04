
const express = require("express");

const {
  createTestRun,
  getProjectTestRuns,
  getTestRun,
  executeTestRun,
} = require("../controllers/testrun.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all TestRun routes
router.use(authMiddleware);

// Create a TestRun
router.post(
  "/projects/:projectId/runs",
  createTestRun
);

// Get all TestRuns for a project
router.get(
  "/projects/:projectId/runs",
  getProjectTestRuns
);

// Execute a TestRun
router.post(
  "/projects/:projectId/runs/:testRunId/execute",
  executeTestRun
);

// Get a single TestRun with results
router.get(
  "/projects/:projectId/runs/:testRunId",
  getTestRun
);

module.exports = router;
