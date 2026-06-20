"use client";

import { useState } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { useStock, useRegistrarStockInicial, useAjusteStock } from "@/hooks/useStock";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { useEmpresa } from "@/context/EmpresaContext";

export default function StockPage() {
  const [stockInicial, setStockInicial] = useState({ idProducto: "", idAlmacen: "", cantidad: "" });
  const [ajuste, setAjuste] = useState({ idProducto: "", idAlmacen: "", cantidadAjuste: "", motivo: "", tipoAjuste: "Entrada" });
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
    Number(stockInicial.cantidad) >= 0 &&
    !registrarInicial.isPending;

  const submitStockInicial = async (e) => {
    e.preventDefault();
    setError("");

    if (!empresaId) {
      setError("Selecciona una empresa antes de registrar stock.");
      return;
    }

    const idProducto = stockInicial.idProducto;
    const idAlmacen = stockInicial.idAlmacen;
    const cantidad = Number(stockInicial.cantidad);

    if (!idProducto || !idAlmacen || !Number.isFinite(cantidad) || cantidad < 0) {
      setError("Completa producto, almacén y una cantidad mayor o igual a 0.");
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
      setError(err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado.");
    }
  };

  const submitAjuste = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await ajustar.mutateAsync({
        idProducto: ajuste.idProducto,
        idAlmacen: ajuste.idAlmacen,
        nuevaCantidad: Number(ajuste.cantidadAjuste),
        tipoAjuste: ajuste.tipoAjuste,
        motivo: ajuste.motivo,
      });
      setAjuste({ idProducto: "", idAlmacen: "", cantidadAjuste: "", motivo: "", tipoAjuste: "Entrada" });
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado.");
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
              {productos.map((p, idx) => (
                <option key={p.idProducto || p.IdProducto || p.productCen || p.ProductCen || `prod-init-${idx}`} value={p.idProducto || p.IdProducto || p.productCen || p.ProductCen}>
                  {p.nombre || p.Nombre || p.name || p.Name}
                </option>
              ))}
            </select>
            <select value={stockInicial.idAlmacen} onChange={(e) => setStockInicial((p) => ({ ...p, idAlmacen: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Almacén</option>
              {almacenes.map((a, idx) => (
                <option key={a.idAlmacen || a.IdAlmacen || a.warehouseCen || a.WarehouseCen || `alm-init-${idx}`} value={a.idAlmacen || a.IdAlmacen || a.warehouseCen || a.WarehouseCen}>
                  {a.nombre || a.Nombre || a.name || a.Name}
                </option>
              ))}
            </select>
            <input type="number" min="0" value={stockInicial.cantidad} onChange={(e) => setStockInicial((p) => ({ ...p, cantidad: e.target.value }))} required placeholder="Cantidad" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
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
              {productos.map((p, idx) => (
                <option key={p.idProducto || p.IdProducto || p.productCen || p.ProductCen || `prod-ajuste-${idx}`} value={p.idProducto || p.IdProducto || p.productCen || p.ProductCen}>
                  {p.nombre || p.Nombre || p.name || p.Name}
                </option>
              ))}
            </select>
            <select value={ajuste.idAlmacen} onChange={(e) => setAjuste((p) => ({ ...p, idAlmacen: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="">Almacén</option>
              {almacenes.map((a, idx) => (
                <option key={a.idAlmacen || a.IdAlmacen || a.warehouseCen || a.WarehouseCen || `alm-ajuste-${idx}`} value={a.idAlmacen || a.IdAlmacen || a.warehouseCen || a.WarehouseCen}>
                  {a.nombre || a.Nombre || a.name || a.Name}
                </option>
              ))}
            </select>
            <select value={ajuste.tipoAjuste} onChange={(e) => setAjuste((p) => ({ ...p, tipoAjuste: e.target.value }))} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent">
              <option value="Entrada">Entrada (Aumentar)</option>
              <option value="Salida">Salida (Disminuir)</option>
            </select>
            <input type="number" min="1" value={ajuste.cantidadAjuste} onChange={(e) => setAjuste((p) => ({ ...p, cantidadAjuste: e.target.value }))} required placeholder="Cantidad a ajustar" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
            <input value={ajuste.motivo} onChange={(e) => setAjuste((p) => ({ ...p, motivo: e.target.value }))} required placeholder="Motivo" className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent" />
          </div>
          <button type="submit" className="rounded-lg px-4 py-2 bg-[#43206b] text-white" disabled={ajustar.isPending}>Ajustar</button>
        </form>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-4 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">No se pudo completar la operación</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

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
                {stock.map((s, idx) => {
                   const idStock = s.idStock || s.IdStock || `stock-${idx}`;
                   return (
                    <tr key={idStock} className="border-b border-gray-100 dark:border-gray-900">
                      <td className="p-3">{s.productoNombre || s.ProductoNombre || s.productName || s.ProductName}</td>
                      <td className="p-3">{s.productoSku || s.ProductoSku}</td>
                      <td className="p-3">{s.almacenNombre || s.AlmacenNombre || s.warehouseName || s.WarehouseName}</td>
                      <td className="p-3">{s.cantidad !== undefined ? s.cantidad : (s.Cantidad !== undefined ? s.Cantidad : (s.availableQuantity !== undefined ? s.availableQuantity : s.AvailableQuantity))}</td>
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
