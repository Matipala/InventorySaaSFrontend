import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_INVENTORY_API_URL;

const apiInventory = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiInventory.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const empresaId = localStorage.getItem("empresaId");
        if (empresaId) {
            config.headers["x-empresa-id"] = empresaId;
        }
    }
    return config;
});

apiInventory.interceptors.response.use(
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

export default apiInventory;
