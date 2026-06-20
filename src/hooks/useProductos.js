import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useProductos(filters = {}) {
    const { empresaId } = useEmpresa();
    const { search = "", categoryCen = "", status = "" } = filters;

    return useQuery({
        queryKey: ["productos", empresaId, search, categoryCen, status],
        queryFn: () =>
            apiInventory
                .get(`/api/inventory/companies/${empresaId}/products`, {
                    params: { search, categoryCen, status },
                })
                .then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post(`/api/inventory/companies/${empresaId}/products`, data).then((r) => r.data),
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
            apiInventory.put(`/api/inventory/companies/${empresaId}/products/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useEliminarProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (id) =>
            apiInventory.patch(`/api/inventory/companies/${empresaId}/products/${id}/status`, { status: "Inactivo" }).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarAgotadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, agotado }) =>
            apiInventory.patch(`/api/inventory/companies/${empresaId}/products/${id}/status`, {
                status: agotado ? "Agotado" : "Activo"
            }).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}

export function useCambiarEstadoProducto() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, activo }) =>
            apiInventory.patch(`/api/inventory/companies/${empresaId}/products/${id}/status`, {
                status: activo ? "Activo" : "Inactivo"
            }).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos", empresaId] });
        },
    });
}
