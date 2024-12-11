import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
// Axios Interceptor

const isDevelopment = import.meta.env.MODE === "development";
const myBaseUrl = isDevelopment
    ? import.meta.env.VITE_API_URL_LOCAL
    : import.meta.env.VITE_API_URL_DEPLOY;

const api = axios.create({
    baseURL: myBaseUrl,
});

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

export default api;
