import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_VENTAS_API_URL;

const apiVentas = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiVentas.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const empresaId = localStorage.getItem("empresaId");
        if (empresaId) {
            const cleanId = empresaId.toString().replace(/^emp-/i, "");
            config.headers["x-empresa-id"] = cleanId;
        }
    }
    return config;
});

apiVentas.interceptors.response.use(
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

export default apiVentas;
