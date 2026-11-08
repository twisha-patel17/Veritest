
import api from "../lib/api";

// Create a new TestRun
export const createTestRun = async (projectId) => {
  const response = await api.post(
    `/projects/${projectId}/runs`
  );

  return response.data;
};

// Get all TestRuns for a project
export const getTestRuns = async (projectId) => {
  const response = await api.get(
    `/projects/${projectId}/runs`
  );

  return response.data;
};

// Get a single TestRun with results
export const getTestRunById = async (projectId, testRunId) => {
  const response = await api.get(
    `/projects/${projectId}/runs/${testRunId}`
  );

  return response.data;
};

// Execute a TestRun
export const executeTestRun = async (projectId, testRunId) => {
  const response = await api.post(
    `/projects/${projectId}/runs/${testRunId}/execute`
  );

  return response.data;
};
