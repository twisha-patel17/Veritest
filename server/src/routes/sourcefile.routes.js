
const express = require("express");

const {
  createSourceFile,
  getSourceFiles,
  getSourceFile,
  deleteSourceFile,
} = require("../controllers/sourcefile.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Create a source file.
router.post("/", createSourceFile);

// Get all source files in a project.
router.get("/", getSourceFiles);

// Get one source file.
router.get("/:fileId", getSourceFile);

// Delete a source file.
router.delete("/:fileId", deleteSourceFile);

module.exports = router;
