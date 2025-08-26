import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requiresVerification?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
}

// Auth API functions
export const authAPI = {
  // Sign up
  signup: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Verify email
  verifyEmail: async (email: string, otp: string): Promise<ApiResponse> => {
    const response = await api.post("/auth/verify-email", { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<ApiResponse> => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    password: string
  ): Promise<ApiResponse> => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.put("/user/profile", userData);
    return response.data;
  },
};

export default api;
