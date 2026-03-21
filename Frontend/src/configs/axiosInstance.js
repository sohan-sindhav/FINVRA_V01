import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Always try to use the server's own message first
      const serverMessage = error.response.data?.message;

      switch (error.response.status) {
        case 400:
          return Promise.reject(new Error(serverMessage || "Bad request"));
        case 401:
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("userStorageChange"));
          break;
        case 403:
          return Promise.reject(
            new Error(serverMessage || "Forbidden - You do not have permission")
          );
        case 404:
          return Promise.reject(new Error(serverMessage || "Not found"));
        case 500:
          return Promise.reject(
            new Error(serverMessage || "Server error - Please try again later")
          );
        default:
          return Promise.reject(new Error(serverMessage || "Something went wrong"));
      }
    } else if (error.request) {
      return Promise.reject(new Error("No response from server"));
    } else {
      console.error("Error: ", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
