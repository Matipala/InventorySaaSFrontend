"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useStock, useRegistrarStockInicial, useAjusteStock } from "@/hooks/useStock";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { useEmpresa } from "@/context/EmpresaContext";

export default function StockPage() {
  const [stockInicial, setStockInicial] = useState({ idProducto: "", idAlmacen: "", cantidad: "" });
  const [ajuste, setAjuste] = useState({ idProducto: "", idAlmacen: "", nuevaCantidad: "", motivo: "" });
  const [error, setError] = useState("");
  const { empresaId, loading: empresaLoading } = useEmpresa();

  const { data: stock = [], isLoading } = useStock();
  const { data: productos = [] } = useProductos();
  const { data: almacenes = [] } = useAlmacenes();

  const registrarInicial = useRegistrarStockInicial();
  const ajustar = useAjusteStock();

  const canSubmitStockInicial =
    !empresaLoading &&
    !!empresaId &&
    !!stockInicial.idProducto &&
    !!stockInicial.idAlmacen &&
    Number(stockInicial.cantidad) > 0 &&
    !registrarInicial.isPending;

  const submitStockInicial = async (e) => {
    e.preventDefault();
    setError("");

    if (!empresaId) {
      setError("Selecciona una empresa antes de registrar stock.");
      return;
    }

    const idProducto = Number(stockInicial.idProducto);
    const idAlmacen = Number(stockInicial.idAlmacen);
    const cantidad = Number(stockInicial.cantidad);

    if (!idProducto || !idAlmacen || !Number.isFinite(cantidad) || cantidad <= 0) {
      setError("Completa producto, almacén y una cantidad mayor a 0.");
      return;
    }

    try {
      await registrarInicial.mutateAsync({
        idProducto,
        idAlmacen,
        cantidad,
      });
      setStockInicial({ idProducto: "", idAlmacen: "", cantidad: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const submitAjuste = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await ajustar.mutateAsync({
        idProducto: Number(ajuste.idProducto),
        idAlmacen: Number(ajuste.idAlmacen),
        nuevaCantidad: Number(ajuste.nuevaCantidad),
        motivo: ajuste.motivo,
      });
      setAjuste({ idProducto: "", idAlmacen: "", nuevaCantidad: "", motivo: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Stock</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <form onSubmit={submitStockInicial} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-3">
          <h2 className="font-semibold">Registrar stock inicial</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={stockInicial.idProducto} onChange={(e) => setStockInicial((p) => ({ ...p, idProducto: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Producto</option>
              {productos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
            </select>
            <select value={stockInicial.idAlmacen} onChange={(e) => setStockInicial((p) => ({ ...p, idAlmacen: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Almacén</option>
              {almacenes.map((a) => <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>)}
            </select>
            <input type="number" min="1" value={stockInicial.cantidad} onChange={(e) => setStockInicial((p) => ({ ...p, cantidad: e.target.value }))} required placeholder="Cantidad" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          </div>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 bg-[#43206b] text-white disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!canSubmitStockInicial}
          >
            {registrarInicial.isPending ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <form onSubmit={submitAjuste} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-3">
          <h2 className="font-semibold">Ajuste manual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={ajuste.idProducto} onChange={(e) => setAjuste((p) => ({ ...p, idProducto: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Producto</option>
              {productos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
            </select>
            <select value={ajuste.idAlmacen} onChange={(e) => setAjuste((p) => ({ ...p, idAlmacen: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Almacén</option>
              {almacenes.map((a) => <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>)}
            </select>
            <input type="number" min="0" value={ajuste.nuevaCantidad} onChange={(e) => setAjuste((p) => ({ ...p, nuevaCantidad: e.target.value }))} required placeholder="Nueva cantidad" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
            <input value={ajuste.motivo} onChange={(e) => setAjuste((p) => ({ ...p, motivo: e.target.value }))} required placeholder="Motivo" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          </div>
          <button type="submit" className="rounded-lg px-4 py-2 bg-[#43206b] text-white" disabled={ajustar.isPending}>Ajustar</button>
        </form>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <BarChart3 size={16} />
          <p className="font-semibold">Existencias</p>
        </div>

        {isLoading ? (
          <p className="p-4 text-sm text-(--foreground)/70">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                  <th className="p-3">Producto</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Almacén</th>
                  <th className="p-3">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => (
                  <tr key={s.idStock} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="p-3">{s.productoNombre}</td>
                    <td className="p-3">{s.productoSku}</td>
                    <td className="p-3">{s.almacenNombre}</td>
                    <td className="p-3">{s.cantidad}</td>
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
