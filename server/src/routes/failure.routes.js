
const express = require("express");

const {
  getProjectFailures,
  getFailure,
} = require("../controllers/failure.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

// Get all failures for a project.
router.get(
  "/projects/:projectId/failures",
  getProjectFailures
);

// Get one failure with its execution evidence.
router.get(
  "/projects/:projectId/failures/:failureId",
  getFailure
);

module.exports = router;
