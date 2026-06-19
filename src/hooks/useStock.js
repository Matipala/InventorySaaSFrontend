import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useStock() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["stock", empresaId],
        queryFn: () => apiInventory.get(`/api/stock`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useRegistrarStockInicial() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => {
            const payload = {
                idProducto: data.idProducto,
                idAlmacen: data.idAlmacen,
                cantidad: Number(data.cantidad)
            };
            return apiInventory.post(`/api/stock/inicial`, payload).then((r) => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stock-bajo", empresaId] });
        },
    });
}

export function useAjusteStock() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => {
            const payload = {
                idProducto: data.idProducto,
                idAlmacen: data.idAlmacen,
                nuevaCantidad: Number(data.nuevaCantidad),
                motivo: data.motivo || "Manual Adjustment"
            };
            return apiInventory.post(`/api/stock/ajuste`, payload).then((r) => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stock-bajo", empresaId] });
        },
    });
}
