import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_COMPRAS_API_URL || "http://localhost:5432";

const apiCompras = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiCompras.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const empresaId = localStorage.getItem("empresaId");
        if (empresaId) {
            config.headers["x-empresa-id"] = empresaId;
        }
    }
    return config;
});

apiCompras.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error.response?.data;
        if (typeof data === "string" && data.trim().length > 0) {
            return Promise.reject(new Error(data));
        }
        const validationErrors = data?.errors;
        const firstValidationMessage = validationErrors
            ? Object.values(validationErrors).flat().find(Boolean)
            : null;
        let message =
            firstValidationMessage ||
            data?.message ||
            data?.mensaje ||
            data?.title ||
            error.message ||
            "Error desconocido";

        if (message === "Network Error") {
            message = "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.";
        }

        return Promise.reject(new Error(message));
    }
);

export default apiCompras;
