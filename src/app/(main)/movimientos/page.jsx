"use client";

import { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle, ArrowLeftRight } from "lucide-react";
import { useMovimientos, useCrearMovimiento } from "@/hooks/useMovimientos";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { useEmpresa } from "@/context/EmpresaContext";
import {
  formatDateTime,
  TIPO_MOVIMIENTO_LABELS,
  TIPO_MOVIMIENTO_COLORS,
  cn,
} from "@/lib/utils";

const TIPOS = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
];

const FORM_DEFAULT = {
  idProducto: "",
  idAlmacen: "",
  idAlmacenDestino: "",
  cantidad: "",
  tipo: "ENTRADA",
};

function Badge({ tipo }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        TIPO_MOVIMIENTO_COLORS[tipo] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {TIPO_MOVIMIENTO_LABELS[tipo] ?? tipo}
    </span>
  );
}

function EntradaForm({ onClose }) {
  const [form, setForm] = useState(FORM_DEFAULT);
  const [toast, setToast] = useState(null);

  const { data: productos = [] } = useProductos();
  const { data: almacenes = [] } = useAlmacenes();
  const { mutate, isPending } = useCrearMovimiento();

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.idProducto || !form.idAlmacen || !form.cantidad) {
      setToast({ type: "error", msg: "Completa todos los campos obligatorios." });
      return;
    }
    if (form.tipo === "TRANSFERENCIA" && !form.idAlmacenDestino) {
      setToast({ type: "error", msg: "Selecciona el almacén destino para la transferencia." });
      return;
    }

    const payload = {
      idProducto: Number(form.idProducto),
      idAlmacen: Number(form.idAlmacen),
      cantidad: Number(form.cantidad),
      tipo: form.tipo,
      ...(form.tipo === "TRANSFERENCIA" && {
        idAlmacenDestino: Number(form.idAlmacenDestino),
      }),
    };

    mutate(payload, {
      onSuccess: () => {
        setToast({ type: "success", msg: "Movimiento registrado correctamente." });
        setForm(FORM_DEFAULT);
        setTimeout(() => {
          setToast(null);
          onClose?.();
        }, 1500);
      },
      onError: (err) => {
        const msg = err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado.";
        setToast({ type: "error", msg });
      },
    });
  };

  const productosActivos = productos.filter((p) => p.activo !== false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">
          Nuevo movimiento de inventario
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {toast && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4",
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tipo de movimiento <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tipo: t.value }))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  form.tipo === t.value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-violet-400"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Producto */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Producto <span className="text-red-500">*</span>
          </label>
          <select
            value={form.idProducto}
            onChange={set("idProducto")}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-vioe-500"
          >
            <option value="">Seleccionar producto…</option>
            {productosActivos.map((p, i) => (
              <option key={p.idProducto ?? i} value={p.idProducto}>
                {p.nombre} — {p.sku}
              </option>
            ))}
          </select>
        </div>

        {/* Almacén origen */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {form.tipo === "TRANSFERENCIA" ? "Almacén origen" : "Almacén"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={form.idAlmacen}
            onChange={set("idAlmacen")}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Seleccionar almacén…</option>
            {almacenes.map((a, i) => (
              <option key={a.idAlmacen ?? i} value={a.idAlmacen}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Almacén destino — solo TRANSFERENCIA */}
        {form.tipo === "TRANSFERENCIA" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Almacén destino <span className="text-red-500">*</span>
            </label>
            <select
              value={form.idAlmacenDestino}
              onChange={set("idAlmacenDestino")}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Seleccionar almacén destino…</option>
              {almacenes
                .filter((a) => String(a.idAlmacen) !== form.idAlmacen)
                .map((a, i) => (
                  <option key={a.idAlmacen ?? i} value={a.idAlmacen}>
                    {a.nombre}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={form.cantidad}
            onChange={set("cantidad")}
            placeholder="0"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Guardando…" : "Registrar movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MovimientosTable({ movimientos, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
        Cargando movimientos…
      </div>
    );
  }

  if (!movimientos?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <ArrowLeftRight size={36} className="opacity-30" />
        <p className="text-sm">No hay movimientos registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-violet-500 overflow-hidden">
      <div className="px-5 py-4 border-b border-violet-500 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Historial de movimientos</h2>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {movimientos.length} registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-50 border-b border-violet-400">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Almacén</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movimientos.map((m, i) => (
              <tr key={m.idMovimiento ?? i} className="hover:bg-violet-100 transition-colors">
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(m.fecha)}</td>
                <td className="px-5 py-3"><Badge tipo={m.tipo} /></td>
                <td className="px-5 py-3 text-gray-800 font-medium">{m.nombreProducto ?? m.id_producto}</td>
                <td className="px-5 py-3 text-gray-600">{m.nombreAlmacen ?? m.id_almacen}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-800">{m.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MovimientosPage() {
  const [showForm, setShowForm] = useState(false);
  const { empresaId } = useEmpresa();
  const { data: movimientos, isLoading } = useMovimientos();
  const { data: productos = [] } = useProductos();
  const { data: almacenes = [] } = useAlmacenes();

  const movimientosConNombres = (movimientos || []).map((m) => {
    const producto = productos.find((p) => p.idProducto === m.idProducto);
    const almacen = almacenes.find((a) => a.idAlmacen === m.idAlmacen);
    return {
      ...m,
      nombreProducto: m.productoNombre || producto?.nombre || m.idProducto,
      nombreAlmacen: m.almacenNombre || almacen?.nombre || m.idAlmacen,
    };
  });

  if (!empresaId) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-3 text-gray-400">
        <ArrowLeftRight size={40} className="opacity-30" />
        <p className="text-sm">Selecciona una empresa para ver los movimientos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tex-black-900">Movimientos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Entradas, salidas, transferencias y ajustes de inventario
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} />
            Nueva entrada
          </button>
        )}
      </div>

      {showForm && <EntradaForm onClose={() => setShowForm(false)} />}

      <MovimientosTable movimientos={movimientosConNombres} isLoading={isLoading} />
    </div>
  );
}
