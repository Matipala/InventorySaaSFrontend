"use client";

import { useMemo, useState } from "react";
import { Ruler } from "lucide-react";
import { useCambiarEstadoUnidad, useCrearUnidad, useUnidades, useActualizarUnidad } from "@/hooks/useUnidades";

const initialForm = { nombre: "", abreviatura: "", activo: true };

export default function UnidadesPage() {
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");

    const { data: unidades = [], isLoading } = useUnidades();
    const crear = useCrearUnidad();
    const actualizar = useActualizarUnidad();
    const cambiarEstado = useCambiarEstadoUnidad();

    const sorted = useMemo(() => [...unidades].sort((a, b) => a.nombre.localeCompare(b.nombre)), [unidades]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editId) {
                await actualizar.mutateAsync({ id: editId, data: form });
            } else {
                await crear.mutateAsync(form);
            }
            setForm(initialForm);
            setEditId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const startEdit = (u) => {
        setEditId(u.idUnidad);
        setForm({ nombre: u.nombre, abreviatura: u.abreviatura, activo: u.activo });
        setError("");
    };

    const cancelEdit = () => {
        setEditId(null);
        setForm(initialForm);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--foreground)">Unidades de medida</h1>
            </div>

            <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={form.nombre}
                        onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Nombre de unidad"
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                        required
                    />
                    <input
                        value={form.abreviatura}
                        onChange={(e) => setForm((p) => ({ ...p, abreviatura: e.target.value }))}
                        placeholder="Abreviatura"
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                        required
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.activo}
                            onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))}
                        />
                        Activa
                    </label>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={crear.isPending || actualizar.isPending}
                        className="rounded-lg px-4 py-2 bg-[#43206b] text-white disabled:opacity-60"
                    >
                        {editId ? "Guardar cambios" : "Crear unidad"}
                    </button>
                    {editId && (
                        <button type="button" onClick={cancelEdit} className="rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                    <Ruler size={16} />
                    <p className="font-semibold">Listado</p>
                </div>

                {isLoading ? (
                    <p className="p-4 text-sm text-(--foreground)/70">Cargando...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Abreviatura</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((u) => (
                                    <tr key={u.idUnidad} className="border-b border-gray-100 dark:border-gray-900">
                                        <td className="p-3">{u.nombre}</td>
                                        <td className="p-3">{u.abreviatura}</td>
                                        <td className="p-3">{u.activo ? "Activa" : "Inactiva"}</td>
                                        <td className="p-3 flex gap-2">
                                            <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700" onClick={() => startEdit(u)}>
                                                Editar
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
                                                onClick={() => cambiarEstado.mutate({ id: u.idUnidad, activo: !u.activo })}
                                            >
                                                {u.activo ? "Desactivar" : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
