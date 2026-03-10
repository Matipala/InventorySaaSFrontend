import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5140";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Inject x-empresa-id from localStorage on every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const empresaId = localStorage.getItem("empresaId");
        if (empresaId) {
            config.headers["x-empresa-id"] = empresaId;
        }
    }
    return config;
});

// Normalize error messages from the API
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.mensaje ||
            error.response?.data?.title ||
            error.message ||
            "Error desconocido";
        return Promise.reject(new Error(message));
    }
);

export default api;
