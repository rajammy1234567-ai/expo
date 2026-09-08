import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2, for iOS/Web localhost, or network IP
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
