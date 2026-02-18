import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// UPDATE THIS WITH YOUR BACKEND IP IF USINGPHYSICAL DEVICE
// 10.0.2.2 is special alias to localhost for Android Emulators
// BUT for physical devices, use your computer's LAN IP
// Your detected IP is: 10.18.155.171
const LOCAL_IP = '10.167.104.171'; 
const PORT = '5000';
const BASE_URL = `http://${LOCAL_IP}:${PORT}/api`;

console.log(`API Base URL: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for slow networks
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
