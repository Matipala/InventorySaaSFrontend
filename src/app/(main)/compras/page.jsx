"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle, AlertCircle, Receipt } from "lucide-react";
import { useCompras, useCrearCompra, useConfirmarCompra, useProveedores } from "@/hooks/useCompras";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { useEmpresa } from "@/context/EmpresaContext";
import { formatDateTime, cn } from "@/lib/utils";

const EMPTY_ITEM = { productCen: "", quantity: "" };

export default function ComprasPage() {
    const { empresaId } = useEmpresa();
    const [page, setPage] = useState(1);
    const { data: comprasData, isLoading } = useCompras({ page, pageSize: 20 });
    const { data: productos = [] } = useProductos();
    const { data: almacenes = [] } = useAlmacenes();
    const { data: proveedores = [] } = useProveedores();

    const compras = comprasData?.items || [];
    const totalPages = comprasData?.totalPages || 1;
    const totalCount = comprasData?.totalCount || 0;

    const [supplierCen, setSupplierCen] = useState("");
    const [warehouseCen, setWarehouseCen] = useState("");
    const [items, setItems] = useState([EMPTY_ITEM]);
    const [toast, setToast] = useState(null);

    const crearCompra = useCrearCompra();
    const confirmarCompra = useConfirmarCompra();

    const productosActivos = useMemo(
        () => productos.filter((p) => {
            if (p.activo === false || p.Activo === false) return false;
            const status = (p.status || p.Status || '').toUpperCase();
            if (status) return status === 'ACTIVE' || status === 'ACTIVO';
            return true;
        }),
        [productos]
    );

    const getField = (obj, ...keys) => {
        if (!obj) return null;
        for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return null;
    };

    const setItem = (index, field, value) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
    const removeItem = (index) =>
        setItems((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setToast(null);

        if (!empresaId) {
            setToast({ type: "error", msg: "Selecciona una empresa primero." });
            return;
        }
        if (!supplierCen.trim()) {
            setToast({ type: "error", msg: "El proveedor es obligatorio." });
            return;
        }
        if (!warehouseCen.trim()) {
            setToast({ type: "error", msg: "El almacen es obligatorio." });
            return;
        }
        if (items.length === 0) {
            setToast({ type: "error", msg: "Agrega al menos un item." });
            return;
        }

        const parsedItems = items.map((item) => ({
            productCen: item.productCen,
            quantity: Number(item.quantity),
        }));

        if (parsedItems.some((i) => !i.productCen || !i.quantity)) {
            setToast({ type: "error", msg: "Completa todos los datos de los items." });
            return;
        }
        if (parsedItems.some((i) => i.quantity <= 0)) {
            setToast({ type: "error", msg: "La cantidad debe ser mayor a cero." });
            return;
        }

        const payload = {
            supplierCen: supplierCen.trim(),
            warehouseCen: warehouseCen.trim(),
            items: parsedItems,
        };

        try {
            await crearCompra.mutateAsync(payload);
            setSupplierCen("");
            setWarehouseCen("");
            setItems([EMPTY_ITEM]);
            setToast({ type: "success", msg: "Compra creada correctamente." });
        } catch (err) {
            setToast({ type: "error", msg: err.response?.data?.mensaje || err.response?.data?.title || err.message || "Ocurrió un error inesperado." });
        }
    };

    const onConfirm = async (id) => {
        setToast(null);
        try {
            await confirmarCompra.mutateAsync(id);
            setToast({ type: "success", msg: "Compra confirmada y stock actualizado." });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ type: "error", msg: err.response?.data?.mensaje || err.message || "Ocurrió un error inesperado." });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-(--foreground)">Compras</h1>
                    <p className="text-sm text-(--foreground)/70 mt-1">Registro, confirmacion y detalle de compras.</p>
                </div>
            </div>

            {toast && (
                <div
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm",
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

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) space-y-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        value={supplierCen}
                        onChange={(e) => setSupplierCen(e.target.value)}
                        required
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                    >
                        <option value="">Seleccione proveedor</option>
                        {proveedores.map((p) => (
                            <option key={getField(p, "supplierCen", "SupplierCen")} value={getField(p, "supplierCen", "SupplierCen")}>
                                {getField(p, "name", "Name")}
                            </option>
                        ))}
                    </select>
                    <select
                        value={warehouseCen}
                        onChange={(e) => setWarehouseCen(e.target.value)}
                        required
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                    >
                        <option value="">Seleccione almacen</option>
                        {almacenes.map((a) => (
                            <option key={getField(a, "warehouseCen", "WarehouseCen", "idAlmacen")} value={getField(a, "warehouseCen", "WarehouseCen", "idAlmacen")}>
                                {getField(a, "name", "Name", "nombre", "Nombre")}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">Items</p>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700"
                        >
                            <Plus size={14} />
                            Agregar item
                        </button>
                    </div>

                    {items.map((item, index) => (
                        <div
                            key={`item-${index}`}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                        >
                            <select
                                value={item.productCen}
                                onChange={(e) => setItem(index, "productCen", e.target.value)}
                                required
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                            >
                                <option value="">Producto</option>
                                {productosActivos.map((p) => (
                                    <option key={getField(p, "productCen", "ProductCen", "idProducto", "IdProducto")} value={getField(p, "productCen", "ProductCen", "idProducto", "IdProducto")}>
                                        {getField(p, "name", "Name", "nombre", "Nombre")} - {getField(p, "sku", "Sku")}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => setItem(index, "quantity", e.target.value)}
                                placeholder="Cantidad"
                                required
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                                    disabled={items.length === 1}
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="rounded-lg px-4 py-2 bg-[#43206b] text-white"
                        disabled={crearCompra.isPending}
                    >
                        Crear compra
                    </button>
                </div>
            </form>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                    <Receipt size={16} />
                    <p className="font-semibold">Listado de compras ({totalCount})</p>
                </div>

                {isLoading ? (
                    <p className="p-4 text-sm text-(--foreground)/70">Cargando...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                                    <th className="p-3">CEN</th>
                                    <th className="p-3">Proveedor</th>
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Items</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compras.length === 0 ? (
                                    <tr>
                                        <td className="p-3 text-sm text-gray-500" colSpan={6}>
                                            No hay compras registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    compras.map((c) => {
                                        const id = getField(c, "orderCen", "OrderCen");
                                        const provCen = getField(c, "supplierCen", "SupplierCen");
                                        const fecha = getField(c, "createdAt", "CreatedAt", "date", "Date");
                                        const estado = getField(c, "status", "Status");
                                        const itemCount = getField(c, "itemCount", "ItemCount");
                                        const provName = proveedores.find(p =>
                                            getField(p, "supplierCen", "SupplierCen") === provCen
                                        );
                                        return (
                                            <tr key={id} className="border-b border-gray-100 dark:border-gray-900">
                                                <td className="p-3 font-mono text-xs">{id?.slice(0, 8)}...</td>
                                                <td className="p-3">{provName ? getField(provName, "name", "Name") : provCen}</td>
                                                <td className="p-3">{fecha ? formatDateTime(fecha) : '-'}</td>
                                                <td className="p-3">{estado}</td>
                                                <td className="p-3">{itemCount ?? 0}</td>
                                                <td className="p-3 flex flex-wrap gap-2">
                                                    <Link
                                                        href={`/compras/${id}`}
                                                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                    {String(estado).toLowerCase() === "pending" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onConfirm(id)}
                                                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
                                                            disabled={confirmarCompra.isPending}
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
