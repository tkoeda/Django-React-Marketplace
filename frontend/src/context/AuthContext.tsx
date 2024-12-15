import {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "../constants";

import api from "../api";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (access: string, refresh: string, userId: string) => void;
    logout: (redirectToLogin: boolean ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    return !!(accessToken && refreshToken);
});

    const location = useLocation();
    const navigate = useNavigate();
    const login = (access: string, refresh: string, userId: string) => {
        localStorage.setItem(ACCESS_TOKEN, access);
        localStorage.setItem(REFRESH_TOKEN, refresh);
        localStorage.setItem(USER_ID, userId);
        setIsLoggedIn(true);
    };

    const logout = (redirectToLogin: boolean = false) => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate(redirectToLogin ? "/login" : "/");
    };
    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error("No refresh token found");
            }
            const response = await api.post(
                "/api/token/refresh/", 
                { refresh: refreshToken }
            );

            const { access } = response.data;
            localStorage.setItem(ACCESS_TOKEN, access);
            return access;
        } catch (error) {
            console.error("Error refreshing token:", error);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);

            return null;
        }
    };

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const newToken = await refreshToken();
                    if (newToken) {
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${newToken}`;
                        return api(originalRequest);
                    } else {
                        // Token refresh failed
                        logout(true);
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
