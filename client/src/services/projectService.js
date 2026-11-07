
import api from "../lib/api";

// Fetch all projects belonging to the logged-in user.
export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

// Create a new project.
export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

// Fetch one project.
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// Update a project.
export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(
    `/projects/${projectId}`,
    projectData
  );
  return response.data;
};

// Delete a project.
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};
