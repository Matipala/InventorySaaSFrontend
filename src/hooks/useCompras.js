import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiCompras from "@/lib/apiCompras";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCompras(filters = {}) {
    const { empresaId } = useEmpresa();
    const { status, page = 1, pageSize = 20, sortDescending = true } = filters;

    return useQuery({
        queryKey: ["compras", empresaId, status, page, pageSize, sortDescending],
        queryFn: () =>
            apiCompras
                .get(`/api/purchases/companies/${empresaId}/orders`, {
                    params: { status, page, pageSize, sortDescending },
                })
                .then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCompra(id) {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["compra", empresaId, id],
        queryFn: () => apiCompras.get(`/api/purchases/companies/${empresaId}/orders/${id}`).then((r) => r.data),
        enabled: !!empresaId && !!id,
    });
}

export function useCrearCompra() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiCompras.post(`/api/purchases/companies/${empresaId}/orders`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras", empresaId] });
        },
    });
}

export function useConfirmarCompra() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (id) => apiCompras.post(`/api/purchases/companies/${empresaId}/orders/${id}/confirm`).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["compra", empresaId] });
        },
    });
}

export function useProveedores() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["proveedores", empresaId],
        queryFn: () => apiCompras.get(`/api/purchases/companies/${empresaId}/suppliers`).then((r) => r.data),
        enabled: !!empresaId,
    });
}
