"use client";

import { useEffect, useState, useCallback } from "react";
import ThemeToggleButton from "../ThemeToggleButton";
import { Building2, PackageCheck, X } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";
import { useRestockEvents } from "@/hooks/useRestockEvents";
import apiInventory from "@/lib/apiInventory";

export default function Header() {
    const { empresaId, setEmpresaId } = useEmpresa();
    const [empresas, setEmpresas] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        apiInventory
            .get("/api/inventory/companies")
            .then((res) => setEmpresas(res.data))
            .catch(() => { });
    }, []);

    const dismissNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    }, []);

    const handleRestockEvent = useCallback((event) => {
        setNotifications((prev) => [...prev.slice(-4), event]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n._id !== event._id));
        }, 8000);
    }, []);

    useRestockEvents(handleRestockEvent);

    return (
        <>
            <header
                className="h-16 px-6 flex items-center justify-between shrink-0 border-b relative"
                style={{
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    borderBottom: '1px solid var(--foreground)',
                }}
            >
                <div className="flex-1" />

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-(--foreground)" />
                        <select
                            value={empresaId ?? ""}
                            onChange={(e) =>
                                setEmpresaId(e.target.value || null)
                            }
                            className="text-sm border border-(--foreground) rounded-lg px-3 py-1.5  dark:bg-white-900 text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--foreground) shadow-sm transition-colors hover:bg-(--foreground)/10 focus:bg-(--foreground)/10"
                            style={{ minWidth: 180 }}
                        >
                            <option value="">Seleccionar empresa…</option>
                            {empresas.map((emp, idx) => (
                                <option key={emp.companyCen || emp.CompanyCen || emp.idEmpresa || emp.IdEmpresa || idx}
                                    value={emp.companyCen || emp.CompanyCen || emp.idEmpresa || emp.IdEmpresa}>
                                    {emp.name || emp.Name || emp.nombre || emp.Nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ThemeToggleButton />
                </div>
            </header>

            {notifications.length > 0 && (
                <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg px-4 py-3 shadow-lg animate-slide-in flex items-start gap-3"
                        >
                            <PackageCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">Restock recibido</p>
                                <p className="text-xs text-emerald-700 truncate">
                                    {n.productName || "Producto"}: +{n.quantity || n.Quantity} unidades
                                </p>
                            </div>
                            <button
                                onClick={() => dismissNotification(n._id)}
                                className="text-emerald-500 hover:text-emerald-700 shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
