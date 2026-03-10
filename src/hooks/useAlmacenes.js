import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEmpresa } from "@/context/EmpresaContext";

export function useAlmacenes() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["almacenes", empresaId],
        queryFn: () => api.get("/api/Almacenes").then((r) => r.data),
        enabled: !!empresaId,
    });
}
