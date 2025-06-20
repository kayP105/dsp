// client/src/lib/api.js

import axios from 'axios';

// Create a new instance of axios with a custom configuration
const api = axios.create({
  baseURL: 'http://localhost:5050/api', // Your backend API's base URL
});

// This is the most important part: the request interceptor.
// This function runs BEFORE any request is sent.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage.
    const token = localStorage.getItem('token');
    
    // 2. If a token exists...
    if (token) {
      // 3. ...add it to the 'Authorization' header.
      // The 'Bearer ' prefix is a standard convention.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 4. Return the modified configuration to be sent.
    return config;
  },
  (error) => {
    // If there's an error during the request setup, reject the promise.
    return Promise.reject(error);
  }
);

export default api;