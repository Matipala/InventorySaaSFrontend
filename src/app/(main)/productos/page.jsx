"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import {
  useActualizarProducto,
  useCambiarAgotadoProducto,
  useCambiarEstadoProducto,
  useCrearProducto,
  useProductos,
} from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { useUnidades } from "@/hooks/useUnidades";
import { AlertError } from "@/components/ui/AlertError";

const initialForm = {
  nombre: "",
  sku: "",
  idCategoria: "",
  idUnidad: "",
  precioVenta: "",
  estacion: "",
  activo: true,
  agotado86: false,
};

export default function ProductosPage() {
  const [filters, setFilters] = useState({ q: "", idCategoria: "", idUnidad: "", activo: "" });
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const queryFilters = useMemo(
    () => ({
      q: filters.q || undefined,
      idCategoria: filters.idCategoria || undefined,
      idUnidad: filters.idUnidad || undefined,
      activo: filters.activo === "" ? undefined : filters.activo === "true",
    }),
    [filters]
  );

  const { data: productos = [], isLoading } = useProductos(queryFilters);
  const { data: categorias = [] } = useCategorias();
  const { data: unidades = [] } = useUnidades();

  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const cambiarEstado = useCambiarEstadoProducto();
  const cambiarAgotado = useCambiarAgotadoProducto();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      nombre: form.nombre,
      sku: form.sku,
      idCategoria: form.idCategoria,
      idUnidad: form.idUnidad || null,
      precioVenta: Number(form.precioVenta),
      estacion: form.estacion || null,
      activo: form.activo,
      agotado86: form.agotado86,
    };

    if (payload.precioVenta <= 0) {
      setError("El precio de venta debe ser mayor a cero");
      return;
    }

    if (!payload.idUnidad) {
      setError("La unidad es obligatoria");
      return;
    }

    try {
      if (editId) {
        await actualizar.mutateAsync({ id: editId, data: payload });
      } else {
        await crear.mutateAsync(payload);
      }
      setForm(initialForm);
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado.");
    }
  };

  const startEdit = (p) => {
    const idProducto = p.idProducto || p.IdProducto || p.productCen || p.ProductCen;
    setEditId(idProducto);
    setForm({
      nombre: p.nombre || p.Nombre || p.name || p.Name,
      sku: p.sku || p.Sku,
      idCategoria: String(p.idCategoria || p.IdCategoria || p.categoryCen || p.CategoryCen || ""),
      idUnidad: p.idUnidad || p.IdUnidad || p.unitCen || p.UnitCen ? String(p.idUnidad || p.IdUnidad || p.unitCen || p.UnitCen) : "",
      precioVenta: String(p.precioVenta || p.PrecioVenta || p.salePrice || p.SalePrice || 0),
      estacion: p.estacion || p.Estacion || "",
      activo: p.activo !== undefined ? p.activo : (p.Activo !== undefined ? p.Activo : (p.status === "ACTIVE" || p.Status === "ACTIVE")),
      agotado86: p.agotado86 !== undefined ? p.agotado86 : (p.Agotado86 !== undefined ? p.Agotado86 : (p.status === "OUT_OF_STOCK" || p.Status === "OUT_OF_STOCK")),
    });
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">Productos</h1>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Buscar por nombre o SKU"
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
        />
        <select
          value={filters.idCategoria}
          onChange={(e) => setFilters((p) => ({ ...p, idCategoria: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c, idx) => (
            <option key={c.idCategoria || c.IdCategoria || c.categoryCen || c.CategoryCen || `cat-filter-${idx}`} value={c.idCategoria || c.IdCategoria || c.categoryCen || c.CategoryCen}>
              {c.nombre || c.Nombre || c.name || c.Name}
            </option>
          ))}
        </select>
        <select
          value={filters.idUnidad}
          onChange={(e) => setFilters((p) => ({ ...p, idUnidad: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
        >
          <option value="">Todas las unidades</option>
          {unidades.map((u, idx) => (
            <option key={u.idUnidad || u.IdUnidad || u.unitCen || u.UnitCen || `uni-filter-${idx}`} value={u.idUnidad || u.IdUnidad || u.unitCen || u.UnitCen}>
              {u.nombre || u.Nombre || u.name || u.Name}
            </option>
          ))}
        </select>
        <select
          value={filters.activo}
          onChange={(e) => setFilters((p) => ({ ...p, activo: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          <input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="SKU" required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          <input value={form.precioVenta} type="number" step="0.01" min="0.01" onChange={(e) => setForm((p) => ({ ...p, precioVenta: e.target.value }))} placeholder="Precio venta" required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          <select value={form.idCategoria} onChange={(e) => setForm((p) => ({ ...p, idCategoria: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
            <option value="">Categoría</option>
            {categorias.map((c, idx) => (
              <option key={c.idCategoria || c.IdCategoria || c.categoryCen || c.CategoryCen || `cat-form-${idx}`} value={c.idCategoria || c.IdCategoria || c.categoryCen || c.CategoryCen}>
                {c.nombre || c.Nombre || c.name || c.Name}
              </option>
            ))}
          </select>
          <select value={form.idUnidad} onChange={(e) => setForm((p) => ({ ...p, idUnidad: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
            <option value="">Unidad (Obligatorio)</option>
            {unidades.filter((u) => {
                const isActive = u.activo !== undefined ? u.activo : (u.Activo !== undefined ? u.Activo : (u.isActive !== undefined ? u.isActive : (u.IsActive !== undefined ? u.IsActive : true)));
                return isActive;
            }).map((u, idx) => (
              <option key={u.idUnidad || u.IdUnidad || u.unitCen || u.UnitCen || `uni-form-${idx}`} value={u.idUnidad || u.IdUnidad || u.unitCen || u.UnitCen}>
                {u.nombre || u.Nombre || u.name || u.Name}
              </option>
            ))}
          </select>
          <select value={form.estacion} onChange={(e) => setForm((p) => ({ ...p, estacion: e.target.value }))} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
            <option value="">Estación (Ninguna)</option>
            <option value="COCINA">COCINA</option>
            <option value="BAR">BAR</option>
            <option value="PARRILLA">PARRILLA</option>
          </select>
          <div className="flex items-center gap-4 text-sm col-span-1 md:col-span-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.activo} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} />Activo</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.agotado86} onChange={(e) => setForm((p) => ({ ...p, agotado86: e.target.checked }))} />Agotado</label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg px-4 py-2 bg-[#43206b] text-white" disabled={crear.isPending || actualizar.isPending}>
            {editId ? "Guardar cambios" : "Crear producto"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(initialForm);
              }}
              className="rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Package size={16} />
          <p className="font-semibold">Catálogo</p>
        </div>

        {isLoading ? (
          <p className="p-4 text-sm text-(--foreground)/70">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Estación</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Activo</th>
                  <th className="p-3">Agotado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => {
                  const idProducto = p.idProducto || p.IdProducto || p.productCen || p.ProductCen || `prod-${idx}`;
                  const activo = p.activo !== undefined ? p.activo : (p.Activo !== undefined ? p.Activo : (p.status === "ACTIVE" || p.Status === "ACTIVE" || p.status === "OUT_OF_STOCK" || p.Status === "OUT_OF_STOCK"));
                  const agotado86 = p.agotado86 !== undefined ? p.agotado86 : (p.Agotado86 !== undefined ? p.Agotado86 : (p.status === "OUT_OF_STOCK" || p.Status === "OUT_OF_STOCK"));
                  return (
                    <tr key={idProducto} className="border-b border-gray-100 dark:border-gray-900">
                      <td className="p-3">{p.sku || p.Sku}</td>
                      <td className="p-3">{p.nombre || p.Nombre || p.name || p.Name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {p.estacion || p.Estacion || "N/A"}
                        </span>
                      </td>
                      <td className="p-3">Bs {Number(p.precioVenta || p.PrecioVenta || p.salePrice || p.SalePrice || 0).toFixed(2)}</td>
                      <td className="p-3">{activo ? "Sí" : "No"}</td>
                      <td className="p-3">{agotado86 ? "Sí" : "No"}</td>
                      <td className="p-3 flex gap-2 flex-wrap">
                        <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700" onClick={() => startEdit(p)}>
                          Editar
                        </button>
                        <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700" onClick={() => cambiarEstado.mutate({ id: idProducto, activo: !activo })}>
                          {activo ? "Desactivar" : "Activar"}
                        </button>
                        <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700" onClick={() => cambiarAgotado.mutate({ id: idProducto, agotado: !agotado86 })}>
                          {agotado86 ? "Quitar" : "Marcar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
