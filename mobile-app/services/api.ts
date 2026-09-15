import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically resolves Render backend in production, or computer IP in local dev
export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:5000/api`;
  }
  return 'http://192.168.31.228:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;

