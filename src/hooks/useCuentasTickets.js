import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiVentas from "@/lib/apiVentas";
import { useEmpresa } from "@/context/EmpresaContext";

export function useCrearCuentaTicket() {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (data) => apiVentas.post(`/api/sales/companies/${empresaId}/tickets`, data).then((r) => r.data),
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
            return apiVentas.post(`/api/sales/companies/${empresaId}/tickets/${finalId}/items`, variables).then((r) => r.data);
        },
        onSuccess: (data, variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["ticket-items", empresaId, finalId] });
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
            return apiVentas.post(`/api/sales/companies/${empresaId}/tickets/${finalId}/payment`, variables).then((r) => r.data);
        },
        onSuccess: (data, variables) => {
            const finalId = variables?.idCuentaTicket || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useCuentaTicketById(idCuentaTicket) {
    const { empresaId } = useEmpresa();
    return useQuery({
        queryKey: ["cuenta-ticket", idCuentaTicket, empresaId],
        queryFn: () => apiVentas.get(`/api/sales/companies/${empresaId}/tickets/${idCuentaTicket}`).then((r) => r.data),
        enabled: !!empresaId && !!idCuentaTicket,
    });
}

export function useCuentasAbiertas() {
    const { empresaId } = useEmpresa();
    return useQuery({
        queryKey: ["cuentas-tickets-abiertas", empresaId],
        queryFn: () => apiVentas.get(`/api/sales/companies/${empresaId}/tickets`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function useEnviarComanda(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (overrideId) => apiVentas.post(`/api/sales/companies/${empresaId}/tickets/${overrideId || idCuentaTicket}/send`).then((r) => r.data),
        onSuccess: (data, variables) => {
            const finalId = variables || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useActualizarMesero(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (nuevoMesero) => apiVentas.put(`/api/sales/companies/${empresaId}/tickets/${idCuentaTicket}/waiter`, { waiterCen: nuevoMesero }).then((r) => r.data),
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
            const finalId = overrideId || idCuentaTicket;
            return apiVentas.post(`/api/sales/companies/${empresaId}/tickets/${finalId}/cancel`).then((r) => r.data);
        },
        onSuccess: (data, variables) => {
            const finalId = variables || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useReenviarComanda(idCuentaTicket) {
    const queryClient = useQueryClient();
    const { empresaId } = useEmpresa();

    return useMutation({
        mutationFn: (overrideId) => apiVentas.post(`/api/sales/companies/${empresaId}/tickets/${overrideId || idCuentaTicket}/resend`).then((r) => r.data),
        onSuccess: (data, variables) => {
            const finalId = variables || idCuentaTicket;
            queryClient.invalidateQueries({ queryKey: ["cuenta-ticket", finalId, empresaId] });
            queryClient.invalidateQueries({ queryKey: ["cuentas-tickets-abiertas", empresaId] });
        },
    });
}

export function useWaiters() {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["waiters", empresaId],
        queryFn: () => apiVentas.get(`/api/sales/companies/${empresaId}/waiters`).then((r) => r.data),
        enabled: !!empresaId,
    });
}

export function usePaymentMethods() {
    return useQuery({
        queryKey: ["payment-methods"],
        queryFn: () => apiVentas.get(`/api/sales/payment-methods`).then((r) => r.data),
    });
}

export function useTicketTotals(ticketCen) {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["ticket-totals", empresaId, ticketCen],
        queryFn: () => apiVentas.get(`/api/sales/companies/${empresaId}/tickets/${ticketCen}/totals`).then((r) => r.data),
        enabled: !!empresaId && !!ticketCen,
    });
}

export function useTicketItems(ticketCen) {
    const { empresaId } = useEmpresa();

    return useQuery({
        queryKey: ["ticket-items", empresaId, ticketCen],
        queryFn: () => apiVentas.get(`/api/sales/companies/${empresaId}/tickets/${ticketCen}/items`).then((r) => r.data),
        enabled: !!empresaId && !!ticketCen,
    });
}
