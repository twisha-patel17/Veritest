
const express = require("express");

const {
  createTestCase,
  getProjectTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
} = require("../controllers/testcase.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/projects/:projectId/testcases",
  createTestCase
);

router.get(
  "/projects/:projectId/testcases",
  getProjectTestCases
);

router.get(
  "/projects/:projectId/testcases/:testCaseId",
  getTestCase
);

router.patch(
  "/projects/:projectId/testcases/:testCaseId",
  updateTestCase
);

router.delete(
  "/projects/:projectId/testcases/:testCaseId",
  deleteTestCase
);

module.exports = router;
