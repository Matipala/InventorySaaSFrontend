import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEmpresa } from "@/context/EmpresaContext";

export function useUnidades() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["unidades", empresaId],
        queryFn: () => api.get("/api/Unidades").then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => api.post("/api/Unidades", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}

export function useActualizarUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/api/Unidades/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}

export function useCambiarEstadoUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, activo }) => api.patch(`/api/Unidades/${id}/estado`, activo).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}
