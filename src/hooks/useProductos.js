import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useProductos(filters = {}) {
    const { empresaId } = useEmpresa();

    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.idCategoria) params.set("idCategoria", String(filters.idCategoria));
    if (filters.idUnidad) params.set("idUnidad", String(filters.idUnidad));
    if (typeof filters.activo === "boolean") params.set("activo", String(filters.activo));

    return useQuery({
        queryKey: ["productos", empresaId, filters],
        queryFn: () => apiInventory.get(`/api/Productos?${params.toString()}`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post("/api/Productos", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
        },
    });
}

export function useActualizarProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, data }) => apiInventory.put(`/api/Productos/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarEstadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, activo }) => apiInventory.patch(`/api/Productos/${id}/estado`, activo).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarAgotadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, agotado }) => apiInventory.patch(`/api/Productos/${id}/agotado`, agotado).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}
