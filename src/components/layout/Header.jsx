"use client";

import { useEffect, useState } from "react";
import ThemeToggleButton from "../ThemeToggleButton";
import { Building2 } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";
import apiInventory from "@/lib/apiInventory";

export default function Header() {
    const { empresaId, setEmpresaId } = useEmpresa();
    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        // List all companies without empresa header (no filter needed)
        apiInventory
            .get("/api/inventory/companies")
            .then((res) => setEmpresas(res.data))
            .catch(() => { });
    }, []);

    return (
        <header
            className="h-16 px-6 flex items-center justify-between shrink-0 border-b"
            style={{
                background: 'var(--background)',
                color: 'var(--foreground)',
                borderBottom: '1px solid var(--foreground)',
            }}
        >
            <div className="flex-1" />

            {/* Empresa selector y theme toggle */}
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
    );
}
