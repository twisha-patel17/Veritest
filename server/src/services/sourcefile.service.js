
const prisma = require("../config/prisma");

// Create a source file after verifying project ownership.
const createSourceFile = async (projectId, userId, fileData) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    return null;
  }

  return prisma.sourceFile.create({
    data: {
      projectId,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      content: fileData.content,
      language: fileData.language,
    },
  });
};

// Get all source files belonging to an owned project.
const getSourceFiles = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    return null;
  }

  return prisma.sourceFile.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

// Get one source file by ID.
const getSourceFileById = async (projectId, userId, fileId) => {
  return prisma.sourceFile.findFirst({
    where: {
      id: fileId,
      projectId,
      project: {
        userId,
      },
    },
  });
};

// Delete one source file.
const deleteSourceFile = async (projectId, userId, fileId) => {
  const existingFile = await getSourceFileById(
    projectId,
    userId,
    fileId
  );

  if (!existingFile) {
    return null;
  }

  return prisma.sourceFile.delete({
    where: {
      id: fileId,
    },
  });
};

module.exports = {
  createSourceFile,
  getSourceFiles,
  getSourceFileById,
  deleteSourceFile,
};
