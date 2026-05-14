"use client";

import { useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { useActualizarCategoria, useCategorias, useCrearCategoria } from "@/hooks/useCategorias";
import { AlertError } from "@/components/ui/AlertError";

export default function CategoriasPage() {
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const { data: categorias = [], isLoading } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();

  const sorted = useMemo(() => [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre)), [categorias]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { nombre };
      if (editId) {
        await actualizar.mutateAsync({ id: editId, data: payload });
      } else {
        await crear.mutateAsync(payload);
      }
      setNombre("");
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Categorías</h1>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de categoría"
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg px-4 py-2 bg-[#43206b] text-white" disabled={crear.isPending || actualizar.isPending}>
              {editId ? "Guardar cambios" : "Crear categoría"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setNombre("");
                }}
                className="rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
        <AlertError error={error} />
      </form>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Tag size={16} />
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
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((categoria) => (
                  <tr key={categoria.idCategoria} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="p-3">{categoria.nombre}</td>
                    <td className="p-3">
                      <button
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
                        onClick={() => {
                          setEditId(categoria.idCategoria);
                          setNombre(categoria.nombre);
                        }}
                      >
                        Editar
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
