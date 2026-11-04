
const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  executeTestRunController,
} = require("../controllers/execution.controller");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/runs/:testRunId/execute",
  executeTestRunController
);

module.exports = router;
