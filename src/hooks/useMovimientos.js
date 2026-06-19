import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useMovimientos(filters = {}) {
    const { empresaId } = useEmpresa();

    const params = new URLSearchParams();
    if (filters.idProducto) params.set("productCen", filters.idProducto);
    if (filters.idAlmacen) params.set("warehouseCen", filters.idAlmacen);
    if (filters.tipo) params.set("documentType", filters.tipo);

    return useQuery({
        queryKey: ["movimientos", empresaId, filters],
        queryFn: () =>
            apiInventory
                .get(`/api/inventory/companies/${empresaId}/documents?${params.toString()}`)
                .then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearMovimiento() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => {
            const contractData = {
                DocumentType: data.tipo === "ENTRADA" ? "ENTRY" : "EXIT",
                WarehouseCen: String(data.idAlmacen),
                Reason: data.motivo || "Manual Adjustment",
                Lines: [{
                    ProductCen: String(data.idProducto),
                    Quantity: data.cantidad
                }]
            };
            return apiInventory.post(`/api/inventory/companies/${empresaId}/documents`, contractData).then((r) => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movimientos", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["stock", empresaId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stock-bajo", empresaId] });
        },
    });
}
