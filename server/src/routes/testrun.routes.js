
const express = require("express");

const {
  createTestRun,
  getProjectTestRuns,
  getTestRun,
} = require("../controllers/testrun.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/runs",
  createTestRun
);

router.get(
  "/projects/:projectId/runs",
  getProjectTestRuns
);

router.get(
  "/projects/:projectId/runs/:testRunId",
  getTestRun
);

module.exports = router;
