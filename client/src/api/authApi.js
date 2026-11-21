import axiosClient from './axiosClient';

export const adminLogin = async (accessCode) => {
  return axiosClient.post('/auth/admin-login', { accessCode });
};

export const leadLogin = async (accessCode) => {
  return axiosClient.post('/auth/lead-login', { accessCode });
};

export const getMe = async () => {
  return axiosClient.get('/auth/me');
};
