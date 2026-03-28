import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiVentas from "@/lib/apiVentas";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCrearCuentaTicket() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiVentas.post("/api/ventas/cuentas", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets", empresaId] });
        },
    });
}

export function useAgregarItemCuentaTicket(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiVentas.post(`/api/ventas/cuentas/${idCuentaTicket}/items`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", idCuentaTicket, empresaId] });
        },
    });
}

export function usePagarCuentaTicket(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiVentas.post(`/api/ventas/cuentas/${idCuentaTicket}/pagar`, data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", idCuentaTicket, empresaId] });
        },
    });
}

export function useCuentaTicketById(idCuentaTicket) {
    const { empresaId } = useEmpresa();
    return useQuery({
        queryKey: ["cuenta-ticket", idCuentaTicket, empresaId],
        queryFn: () => apiVentas.get(`/api/ventas/cuentas/${idCuentaTicket}`).then((r) => r.data),
        enabled: !!empresaId && !!idCuentaTicket,
    });
}
