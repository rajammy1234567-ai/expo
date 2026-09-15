import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically resolves Render backend in production
export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Live Render Production Backend
  return 'https://viz-expo-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;

