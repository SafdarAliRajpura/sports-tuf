import axios from 'axios';

// Use your machine's LAN IP address to work on both Emulator and Physical Device
const API_URL = 'http://10.167.104.171:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
