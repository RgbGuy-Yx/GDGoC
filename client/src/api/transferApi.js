import axiosClient from './axiosClient';

export const transferCandidate = async (candidateId, { destinationDomain, destinationLeadId, transferReason, remarks }) => {
  return axiosClient.post(`/candidates/${candidateId}/transfer`, {
    destinationDomain,
    destinationLeadId,
    transferReason,
    remarks
  });
};

export const getTransferHistory = async (candidateId) => {
  return axiosClient.get(`/candidates/${candidateId}/transfers`);
};

export const getAllTransfersAdmin = async () => {
  return axiosClient.get('/candidates/admin/all-transfers');
};

export const getTransferredByMe = async () => {
  return axiosClient.get('/candidates/lead/transferred-by-me');
};
