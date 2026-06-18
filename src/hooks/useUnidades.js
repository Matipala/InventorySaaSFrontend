import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useUnidades() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["unidades", empresaId],
        queryFn: () => apiInventory.get(`/api/unidades`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post(`/api/unidades`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}

export function useActualizarUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, data }) => apiInventory.put(`/api/unidades/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}

export function useCambiarEstadoUnidad() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, activo }) => apiInventory.patch(`/api/unidades/${id}/estado`, activo).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unidades", empresaId] });
        },
    });
}
