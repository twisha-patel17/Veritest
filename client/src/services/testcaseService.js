import api from "../lib/api";

export const getTestCases = async (projectId) => {
  const response = await api.get(
    `/projects/${projectId}/testcases`
  );

  return response.data;
};

export const getTestCaseById = async (projectId, testCaseId) => {
  const response = await api.get(
    `/projects/${projectId}/testcases/${testCaseId}`
  );

  return response.data;
};

export const createTestCase = async (projectId, testCaseData) => {
  const response = await api.post(
    `/projects/${projectId}/testcases`,
    testCaseData
  );

  return response.data;
};

export const updateTestCase = async (
  projectId,
  testCaseId,
  testCaseData
) => {
  const response = await api.patch(
    `/projects/${projectId}/testcases/${testCaseId}`,
    testCaseData
  );

  return response.data;
};

export const deleteTestCase = async (projectId, testCaseId) => {
  const response = await api.delete(
    `/projects/${projectId}/testcases/${testCaseId}`
  );

  return response.data;
};
// Generate AI test cases for a source file.
export const generateAITestCases = async (
  projectId,
  sourceFileId
) => {
  const response = await api.post(
    `/projects/${projectId}/ai/generate-tests`,
    { sourceFileId }
  );

  return response.data;
};