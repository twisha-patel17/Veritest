
const express = require("express");

const {
  generateTestCases,
} = require("../controllers/ai-testcase.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/ai/generate-tests",
  generateTestCases
);

module.exports = router;
