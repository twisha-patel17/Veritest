
import api from "../lib/api";

// Fetch failures belonging to one project.
export const getProjectFailures = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/failures`);
  return response.data;
};

// Fetch one failure with its execution evidence.
export const getFailureById = async (projectId, failureId) => {
  const response = await api.get(
    `/projects/${projectId}/failures/${failureId}`
  );
  return response.data;
};
