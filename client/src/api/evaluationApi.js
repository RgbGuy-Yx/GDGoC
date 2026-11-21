import axiosClient from './axiosClient';

export const addEvaluation = async (candidateId, { score, remarks }) => {
  return axiosClient.post(`/candidates/${candidateId}/evaluations`, { score, remarks });
};

export const getEvaluations = async (candidateId) => {
  return axiosClient.get(`/candidates/${candidateId}/evaluations`);
};

export const getAllEvaluationsAdmin = async () => {
  return axiosClient.get('/candidates/admin/all-evaluations');
};
