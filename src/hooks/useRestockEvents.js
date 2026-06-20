"use client";
import { useEffect, useRef } from "react";
import { useEmpresa } from "@/context/EmpresaContext";

export function useRestockEvents(onEvent) {
    const { empresaId } = useEmpresa();
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    });

    useEffect(() => {
        if (!empresaId) return;

        const inventoryUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:5143";
        const url = `${inventoryUrl}/api/inventory/companies/${empresaId}/restock-events`;

        const source = new EventSource(url);

        source.onmessage = (e) => {
            try {
                const restock = JSON.parse(e.data);
                if (onEventRef.current) {
                    onEventRef.current({ ...restock, _id: Date.now() + Math.random() });
                }
            } catch (err) {
                console.error("Error parsing SSE event:", err);
            }
        };

        source.onerror = () => {
            console.warn("SSE connection error — el navegador reintentará automáticamente");
        };

        return () => {
            source.close();
        };
    }, [empresaId]);
}
