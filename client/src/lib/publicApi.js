// client/src/lib/publicApi.js
import axios from 'axios';

// A clean, simple instance with NO interceptors.
const publicApi = axios.create({
  baseURL: 'http://localhost:5050/api',
});

export default publicApi;