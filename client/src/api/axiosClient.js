import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to all outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gdgoc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: 'Something went wrong',
      status: error.response ? error.response.status : 500,
      errors: error.response?.data?.errors || null
    };

    if (error.response?.data?.message) {
      customError.message = error.response.data.message;
    } else if (error.message) {
      customError.message = error.message;
    }

    if (error.response?.status === 401) {
      // Auto logout if unauthenticated on protected routes
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('gdgoc_token');
        localStorage.removeItem('gdgoc_user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(customError);
  }
);

export default axiosClient;
