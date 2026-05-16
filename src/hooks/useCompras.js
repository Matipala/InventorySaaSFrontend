import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiCompras from "@/lib/apiCompras";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCompras() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["compras", empresaId],
        queryFn: () => apiCompras.get("/api/purchases/orders").then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCompra(id) {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["compra", empresaId, id],
        queryFn: () => apiCompras.get(`/api/purchases/orders/${id}`).then((r) => r.data),
        enabled: !!empresaId && !!id,
    });
}

export function useCrearCompra() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiCompras.post("/api/purchases/orders", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras", empresaId] });
        },
    });
}

export function useConfirmarCompra() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (id) => apiCompras.post(`/api/purchases/orders/${id}/confirm`).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["compra", empresaId] });
        },
    });
}
