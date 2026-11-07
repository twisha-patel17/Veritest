
import api from "../lib/api";

// Fetch all source files belonging to a project.
export const getSourceFiles = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/files`);
  return response.data;
};

// Fetch one source file.
export const getSourceFileById = async (projectId, fileId) => {
  const response = await api.get(
    `/projects/${projectId}/files/${fileId}`
  );
  return response.data;
};

// Save a source file to a project.
export const createSourceFile = async (projectId, fileData) => {
  const response = await api.post(
    `/projects/${projectId}/files`,
    fileData
  );
  return response.data;
};

// Delete a source file.
export const deleteSourceFile = async (projectId, fileId) => {
  const response = await api.delete(
    `/projects/${projectId}/files/${fileId}`
  );
  return response.data;
};
