import axiosClient from './axiosClient';

export const importSpreadsheet = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosClient.post('/candidates/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
