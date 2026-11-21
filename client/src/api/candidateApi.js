import axiosClient from './axiosClient';

export const getAllCandidates = async (params = {}) => {
  return axiosClient.get('/candidates', { params });
};

export const getAssignedCandidates = async (params = {}) => {
  return axiosClient.get('/candidates/assigned', { params });
};

export const getCandidateById = async (id, params = {}) => {
  return axiosClient.get(`/candidates/${id}`, { params });
};

export const updateShortlistStatus = async (id, shortlistStatus) => {
  return axiosClient.patch(`/candidates/${id}/shortlist`, { shortlistStatus });
};

export const updateFinalSelectionStatus = async (id, finalSelectionStatus) => {
  return axiosClient.patch(`/candidates/${id}/final-selection`, { finalSelectionStatus });
};
