import axiosClient from './axiosClient';

export const getDomains = async () => {
  return axiosClient.get('/leads/domains');
};

export const getAllLeads = async () => {
  return axiosClient.get('/leads');
};

export const createLead = async ({ name, accessCode, assignedDomains }) => {
  return axiosClient.post('/leads', { name, accessCode, assignedDomains });
};
