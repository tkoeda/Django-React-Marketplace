import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
// Axios Interceptor

const isDevelopment = import.meta.env.MODE === "development";
const myBaseUrl = isDevelopment ? import.meta.env.VITE_API_URL_LOCAL : import.meta.env.VITE_API_URL_DEPLOY;

const api = axios.create({
    baseURL: myBaseUrl,
});

const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }
        const response = await api.post(
            '/api/token/refresh/', // Remove baseURL since api instance already has it
            { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem(ACCESS_TOKEN, access);
        return access;
    } catch (error) {
        console.error("Error refreshing token:", error);
        // If refresh fails, log out the user
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login"; // Redirect to login page
        return null;
    }
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is due to an invalid token and we haven't tried to refresh yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken = await refreshToken();
            if (newToken) {
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
