import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useProductos(filters = {}) {
    const { empresaId } = useEmpresa();
    const { q = "", idCategoria = "", idUnidad = "", activo = "" } = filters;

    return useQuery({
        queryKey: ["productos", empresaId, q, idCategoria, idUnidad, activo],
        queryFn: () =>
            apiInventory
                .get(`/api/productos`, {
                    params: { q, idCategoria, idUnidad, activo },
                })
                .then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post(`/api/productos`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useActualizarProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, data }) =>
            apiInventory.put(`/api/productos/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useEliminarProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (id) => apiInventory.patch(`/api/productos/${id}/estado`, false).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarAgotadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, agotado }) => apiInventory.patch(`/api/productos/${id}/agotado`, agotado).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarEstadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, activo }) => apiInventory.patch(`/api/productos/${id}/estado`, activo).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}
