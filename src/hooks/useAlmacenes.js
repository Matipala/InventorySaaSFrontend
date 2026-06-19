import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useAlmacenes() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["almacenes", empresaId],
        queryFn: () => apiInventory.get(`/api/almacenes`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearAlmacen() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post(`/api/almacenes`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["almacenes", empresaId] });
        },
    });
}
