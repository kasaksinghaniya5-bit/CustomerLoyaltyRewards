
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the correct authentication token
api.interceptors.request.use((config) => {
  const url = config.url || "";

  let token;

  if (url.startsWith("/admin")) {
    token = localStorage.getItem("adminToken");
  } else if (url.startsWith("/customer")) {
    token = localStorage.getItem("customerToken");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
