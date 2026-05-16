"use client";

import { useState, useEffect } from "react";
import apiVentas from "@/lib/apiVentas";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
    const [config, setConfig] = useState({ nombreImpuesto: "IVA", porcentajeImpuesto: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiVentas.get("/api/ventas/configuracion")
            .then(r => setConfig(r.data))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiVentas.put("/api/ventas/configuracion", config);
            alert("Configuración guardada");
        } catch (e) {
            alert("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-6">Cargando configuración...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings /> Configuración de Ventas
            </h1>

            <div className="bg-(--background) p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Impuesto (ej: IVA)</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 bg-transparent"
                            value={config.nombreImpuesto}
                            onChange={e => setConfig(p => ({ ...p, nombreImpuesto: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Porcentaje de Impuesto (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border rounded-lg px-3 py-2 bg-transparent"
                            value={config.porcentajeImpuesto}
                            onChange={e => setConfig(p => ({ ...p, porcentajeImpuesto: Number(e.target.value) }))}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este porcentaje se aplicará a todas las nuevas ventas. 0 significa sin impuesto.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar Configuración"}
                    </button>
                </form>
            </div>
        </div>
    );
}
