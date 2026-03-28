import { useQuery } from "@tanstack/react-query";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";

export function useAlmacenes() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["almacenes", empresaId],
        queryFn: () => apiInventory.get("/api/Almacenes").then((r) => r.data),
        enabled: !!empresaId,
    });
}
