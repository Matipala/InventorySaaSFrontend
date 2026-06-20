"use client";

import { useState, useEffect } from "react";
import apiVentas from "@/lib/apiVentas";
import { Settings } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";

export default function ConfiguracionPage() {
    const { empresaId } = useEmpresa();
    const [globalTaxPercentage, setGlobalTaxPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!empresaId) return;
        apiVentas.get(`/api/sales/companies/${empresaId}/tax-configuration`)
            .then(r => {
                const data = r.data;
                const apiValue = data.globalTaxPercentage !== undefined
                    ? data.globalTaxPercentage
                    : (data.GlobalTaxPercentage !== undefined ? data.GlobalTaxPercentage : 0);
                setGlobalTaxPercentage(apiValue === 0 ? "" : apiValue.toString());
            })
            .catch(err => {
                console.error("Error cargando configuración:", err);
                setGlobalTaxPercentage("13");
            })
            .finally(() => setLoading(false));
    }, [empresaId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiVentas.put(`/api/sales/companies/${empresaId}/tax-configuration`, {
                globalTaxPercentage: Number(globalTaxPercentage)
            });
            alert("Configuración guardada correctamente");
        } catch (e) {
            console.error("Error al guardar:", e);
            alert("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-6 text-center">Cargando configuración...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings /> Configuración de Ventas
            </h1>

            <div className="bg-(--background) p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Porcentaje de Impuesto Global (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500"
                            value={globalTaxPercentage}
                            onChange={e => setGlobalTaxPercentage(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este porcentaje se aplicará automáticamente al añadir productos a las cuentas.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        {saving ? "Guardando..." : "Guardar Configuración"}
                    </button>
                </form>
            </div>
        </div>
    );
}
