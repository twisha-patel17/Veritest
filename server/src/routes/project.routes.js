
const express = require("express");

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProject);

router.get("/", getProjects);

router.get("/:projectId", getProject);

router.patch("/:projectId", updateProject);

router.delete("/:projectId", deleteProject);

module.exports = router;
