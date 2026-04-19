import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://10.48.61.171:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
       console.error("Token Retrieval Error:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to log connection errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Call Failure:', {
       message: error.message,
       url: error.config?.url,
       method: error.config?.method,
       status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default apiClient;
