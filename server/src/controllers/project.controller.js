
const { z } = require("zod");
const projectService = require("../services/project.service");

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().max(500).optional(),
  language: z.enum(["javascript", "typescript", "python"]),
  framework: z.string().trim().max(50).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  language: z.enum(["javascript", "typescript", "python"]).optional(),
  framework: z.string().trim().max(50).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

// Create project
const createProject = async (req, res, next) => {
  try {
    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const project = await projectService.createProject(
      req.user.id,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Get all user projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(
      req.params.projectId,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const project = await projectService.updateProject(
      req.params.projectId,
      req.user.id,
      validation.data
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.deleteProject(
      req.params.projectId,
      req.user.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
