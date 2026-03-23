import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEmpresa } from "@/context/EmpresaContext";

export function useStock() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["stock", empresaId],
        queryFn: () => api.get("/api/Stock").then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useRegistrarStockInicial() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => api.post("/api/Stock/inicial", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["movimientos", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-bajo", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-agotado", empresaId] });
        },
    });
}

export function useAjusteStock() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => api.post("/api/Stock/ajuste", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["movimientos", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-bajo", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-agotado", empresaId] });
        },
    });
}
