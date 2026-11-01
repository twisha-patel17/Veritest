
const prisma = require("../config/prisma");

// Create a new project
const createProject = async (userId, projectData) => {
  return prisma.project.create({
    data: {
      name: projectData.name,
      description: projectData.description || null,
      language: projectData.language,
      framework: projectData.framework || null,
      userId,
    },
  });
};

// Get all projects belonging to a user
const getUserProjects = async (userId) => {
  return prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// Get one project by ID, ensuring ownership
const getProjectById = async (projectId, userId) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      sourceFiles: true,
      testCases: true,
    },
  });
};

// Update a project, ensuring ownership
const updateProject = async (projectId, userId, projectData) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!existingProject) {
    return null;
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      ...(projectData.name !== undefined && {
        name: projectData.name,
      }),
      ...(projectData.description !== undefined && {
        description: projectData.description,
      }),
      ...(projectData.language !== undefined && {
        language: projectData.language,
      }),
      ...(projectData.framework !== undefined && {
        framework: projectData.framework,
      }),
    },
  });
};

// Delete a project, ensuring ownership
const deleteProject = async (projectId, userId) => {
  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!existingProject) {
    return null;
  }

  return prisma.project.delete({
    where: {
      id: projectId,
    },
  });
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
