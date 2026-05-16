import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useMovimientos(filters = {}) {
    const { empresaId } = useEmpresa();

    const params = new URLSearchParams();
    if (filters.idProducto) params.set("idProducto", filters.idProducto);
    if (filters.idAlmacen) params.set("idAlmacen", filters.idAlmacen);
    if (filters.tipo) params.set("tipo", filters.tipo);

    return useQuery({
        queryKey: ["movimientos", empresaId, filters],
        queryFn: () =>
            apiInventory
                .get(`/api/Movimientos?${params.toString()}`)
                .then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearMovimiento() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) =>
            apiInventory.post("/api/Movimientos", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movimientos", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-bajo", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["alertas-stock-agotado", empresaId] });
        },
    });
}
