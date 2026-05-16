
"use client";
import { useState } from "react";
import { Warehouse } from "lucide-react";
import apiInventory from "@/lib/apiInventory";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { AlertError } from "@/components/ui/AlertError";

export default function AlmacenesPage() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { data: almacenes, refetch } = useAlmacenes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiInventory.post("/api/Almacenes", { nombre });
      setSuccess("Almacén creado correctamente");
      setNombre("");
      refetch();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.title || err.message || "Error al crear almacén");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Almacenes</h1>
        <p className="text-sm text-[var(--foreground)/0.7] mt-1">Gestión de almacenes y ubicaciones</p>
      </div>
      <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-10 gap-3 text-[var(--foreground)/0.6]">
        <Warehouse size={40} className="opacity-40" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-xs mt-4">
          <input
            type="text"
            className="border rounded px-3 py-2 focus:outline-none focus:ring"
            placeholder="Nombre del almacén"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-violet-700 hover:bg-violet-800 text-white font-semibold rounded px-4 py-2 disabled:opacity-50"
            disabled={loading || !nombre.trim()}
          >
            {loading ? "Creando..." : "Crear almacén"}
          </button>
        </form>
        <AlertError error={error} />
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Lista de almacenes</h2>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                <th className="p-3">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {almacenes?.length > 0 ? (
                almacenes.map((a) => (
                  <tr key={a.idAlmacen} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="p-3">{a.nombre}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-sm text-gray-500">No hay almacenes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
