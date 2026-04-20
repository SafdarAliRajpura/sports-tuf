import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Dynamically get the host machine's IP for Zero-Config connectivity
const getLocalIp = () => {
  const hostUri = Constants.expoConfig?.hostUri || 
                  Constants.expoConfig?.extra?.expoGo?.debuggerHost || 
                  Constants.manifest?.debuggerHost;
                  
  return hostUri?.split(':').shift() || '10.48.61.171';
};

const API_URL = `http://${getLocalIp()}:5000`;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000,
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
    const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
    
    // Alert the user if it's a network error (likely wrong IP)
    if (error.message === 'Network Error' || !error.response) {
      alert(`Backend Unreachable!\nTrying: ${fullUrl}\n\nPlease check if your Server is running and IP matches.`);
    }

    console.error('API Call Failure:', {
       message: error.message,
       fullUrl: fullUrl,
       method: error.config?.method,
       status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default apiClient;
