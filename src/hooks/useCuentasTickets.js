import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiVentas from "@/lib/apiVentas";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCrearCuentaTicket() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiVentas.post("/api/ventas/cuentas", data).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useAgregarItemCuentaTicket(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            return apiVentas.post(`/api/ventas/cuentas/${finalId}/items`, variables).then((r) => r.data);
        },
        onSuccess: (data, variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", Number(finalId), empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function usePagarCuentaTicket(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            return apiVentas.post(`/api/ventas/cuentas/${finalId}/pagar`, variables).then((r) => r.data).catch(err => {
                console.error("Mutation function error (Pagar):", err);
                throw err;
            });
        },
        onSuccess: (data, variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", Number(finalId), empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
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

export function useCuentasAbiertas() {
    const { empresaId } = useEmpresa();
    return useQuery({
        queryKey: ["cuentas-tickets-abiertas", empresaId],
        queryFn: () => apiVentas.get("/api/ventas/cuentas/abiertas").then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useEnviarComanda(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (overrideId) => apiVentas.post(`/api/ventas/cuentas/${Number(overrideId || idCuentaTicket)}/comanda`).then((r) => r.data),
        onSuccess: (data, variables) => {
            const finalId = variables || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", Number(finalId), empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useActualizarMesero(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (nuevoMesero) => apiVentas.patch(`/api/ventas/cuentas/${idCuentaTicket}/mesero`, { nuevoMesero }).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", idCuentaTicket, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useCancelarCuentaTicket(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (overrideId) => {
            const finalId = Number(overrideId || idCuentaTicket);
            return apiVentas.post(`/api/ventas/cuentas/${finalId}/cancelar`).then((r) => r.data);
        },
        onSuccess: (data, variables) => {
            const finalId = Number(variables || idCuentaTicket);
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useReenviarComanda(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (overrideId) => apiVentas.post(`/api/ventas/cuentas/${Number(overrideId || idCuentaTicket)}/reenviar-comanda`).then((r) => r.data),
        onSuccess: (data, variables) => {
            const finalId = variables || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", Number(finalId), empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}
