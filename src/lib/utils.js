import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely (clsx + tailwind-merge).
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string to a readable date in Spanish.
 */
export function formatFecha(fechaStr) {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

/**
 * Format an ISO date string to a readable date + time in Spanish.
 */
export function formatDateTime(fechaStr) {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Map movement type codes to human-readable labels.
 */
export const TIPO_MOVIMIENTO_LABELS = {
    ENTRADA: "Entrada",
    SALIDA: "Salida",
    TRANSFERENCIA: "Transferencia",
    AJUSTE_POSITIVO: "Ajuste +",
    AJUSTE_NEGATIVO: "Ajuste −",
};

/**
 * Map movement type codes to color classes.
 */
export const TIPO_MOVIMIENTO_COLORS = {
    ENTRADA: "text-green-700 bg-green-100",
    SALIDA: "text-red-700 bg-red-100",
    TRANSFERENCIA: "text-blue-700 bg-blue-100",
    AJUSTE_POSITIVO: "text-emerald-700 bg-emerald-100",
    AJUSTE_NEGATIVO: "text-orange-700 bg-orange-100",
};

/**
 * Format a number as currency in CLP.
 */
export function formatCurrency(amount) {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
