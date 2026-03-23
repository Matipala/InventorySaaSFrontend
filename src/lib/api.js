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
        const data = error.response?.data;

        // ASP.NET often returns plain text for BadRequest("mensaje")
        if (typeof data === "string" && data.trim().length > 0) {
            return Promise.reject(new Error(data));
        }

        // ValidationProblemDetails: flatten first field error
        const validationErrors = data?.errors;
        const firstValidationMessage = validationErrors
            ? Object.values(validationErrors).flat().find(Boolean)
            : null;

        const message =
            firstValidationMessage ||
            data?.message ||
            data?.mensaje ||
            data?.title ||
            error.message ||
            "Error desconocido";
        return Promise.reject(new Error(message));
    }
);

export default api;
