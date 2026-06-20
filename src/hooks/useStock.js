import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useStock() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["stock", empresaId],
        queryFn: () => apiInventory.get(`/api/inventory/companies/${empresaId}/stock`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useRegistrarStockInicial() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => {
            const payload = {
                warehouseCen: data.idAlmacen,
                reason: "Stock inicial",
                lines: [{
                    productCen: data.idProducto,
                    quantity: Number(data.cantidad),
                    adjustmentType: "Entrada"
                }]
            };
            return apiInventory.post(`/api/inventory/companies/${empresaId}/stock/adjustments`, payload).then((r) => r.data);
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
                warehouseCen: data.idAlmacen,
                reason: data.motivo || "Ajuste manual",
                lines: [{
                    productCen: data.idProducto,
                    quantity: Number(data.nuevaCantidad),
                    adjustmentType: data.tipoAjuste || "Entrada"
                }]
            };
            return apiInventory.post(`/api/inventory/companies/${empresaId}/stock/adjustments`, payload).then((r) => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stock-bajo", empresaId] });
        },
    });
}
