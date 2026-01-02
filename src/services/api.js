import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

// ❌ REMOVED: This logic bypasses the proxy.
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Create axios instance with base configuration
const apiClient = axios.create({
  // ✅ NEW: Empty string ensures requests go to localhost:3000 (hitting the proxy)
  baseURL: "", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check if user is authenticated
      const session = await fetchAuthSession();

      if (session?.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Optional: Remove console log in production to keep console clean
      // console.log("No active session");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - user session expired
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      // Note: In React, it's often better to use a navigate function or state 
      // rather than window.location.href to preserve SPA state, but this works.
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API Methods
export const pollApi = {
  // Get all polls
  // Resulting URL: http://localhost:3000/polls (Proxied to AWS)
  getAllPolls: () => apiClient.get("/polls"),

  // Get a specific poll
  getPoll: (pollId) => apiClient.get(`/polls/${pollId}`),

  // Create a new poll (requires auth)
  createPoll: (data) => apiClient.post("/polls", data),

  // Vote on a poll (requires auth)
  vote: (pollId, choiceId) =>
    apiClient.post(`/polls/${pollId}/vote`, { choiceId }),
};