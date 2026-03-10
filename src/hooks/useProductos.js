import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEmpresa } from "@/context/EmpresaContext";

export function useProductos() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["productos", empresaId],
        queryFn: () => api.get("/api/Productos").then((r) => r.data),
        enabled: !!empresaId,
    });
}
