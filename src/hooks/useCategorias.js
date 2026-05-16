import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCategorias() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["categorias", empresaId],
        queryFn: () => apiInventory.get("/api/Categorias").then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useCrearCategoria() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiInventory.post("/api/Categorias", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categorias", empresaId] });
        },
    });
}

export function useActualizarCategoria() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: ({ id, data }) => apiInventory.put(`/api/Categorias/${id}`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categorias", empresaId] });
        },
    });
}
