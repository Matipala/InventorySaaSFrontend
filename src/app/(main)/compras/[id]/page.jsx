"use client";

import Link from "next/link";
import { useMemo, use } from "react";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useCompra, useConfirmarCompra, useProveedores } from "@/hooks/useCompras";
import { useProductos } from "@/hooks/useProductos";
import { formatDateTime, cn } from "@/lib/utils";

const getField = (obj, ...keys) => {
    if (!obj) return null;
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return null;
};

export default function CompraDetallePage({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { data: compra, isLoading } = useCompra(id);
    const { data: productos = [] } = useProductos();
    const { data: proveedores = [] } = useProveedores();
    const confirmarCompra = useConfirmarCompra();

    const productMap = useMemo(() => {
        const map = new Map();
        productos.forEach((p) => {
            const key = getField(p, "productCen", "ProductCen", "idProducto", "IdProducto");
            if (key) map.set(String(key), p);
        });
        return map;
    }, [productos]);

    const onConfirm = () => {
        confirmarCompra.mutate(id);
    };

    const orderCen = getField(compra, "orderCen", "OrderCen");
    const status = getField(compra, "status", "Status");
    const createdAt = getField(compra, "createdAt", "CreatedAt", "date", "Date");
    const confirmedAt = getField(compra, "confirmedAt", "ConfirmedAt");
    const supplierCen = getField(compra, "supplierCen", "SupplierCen");
    const warehouseCen = getField(compra, "warehouseCen", "WarehouseCen");
    const items = getField(compra, "items", "Items") || [];

    const supplierName = proveedores.find(p =>
        getField(p, "supplierCen", "SupplierCen") === supplierCen
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/compras"
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700"
                >
                    <ArrowLeft size={14} />
                    Volver
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-(--foreground)">Detalle de compra</h1>
                    <p className="text-sm text-(--foreground)/70 mt-1">Compra #{orderCen?.slice(0, 8)}</p>
                </div>
            </div>

            {confirmarCompra.isSuccess && (
                <div className={cn("flex items-center gap-2 px-4 py-3 rounded-lg text-sm", "bg-green-50 text-green-700 border border-green-200")}>
                    <CheckCircle size={16} />
                    Compra confirmada.
                </div>
            )}
            {confirmarCompra.isError && (
                <div className={cn("flex items-center gap-2 px-4 py-3 rounded-lg text-sm", "bg-red-50 text-red-700 border border-red-200")}>
                    <AlertCircle size={16} />
                    {confirmarCompra.error?.message || "No se pudo confirmar la compra."}
                </div>
            )}

            {isLoading ? (
                <p className="text-sm text-(--foreground)/70">Cargando...</p>
            ) : !compra ? (
                <p className="text-sm text-(--foreground)/70">Compra no encontrada.</p>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-(--background) grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <p className="text-xs uppercase text-(--foreground)/60">Proveedor</p>
                            <p className="font-semibold">{supplierName ? getField(supplierName, "name", "Name") : supplierCen}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-(--foreground)/60">Fecha</p>
                            <p className="font-semibold">{createdAt ? formatDateTime(createdAt) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-(--foreground)/60">Estado</p>
                            <p className="font-semibold">{status}</p>
                        </div>
                        {confirmedAt && (
                            <div>
                                <p className="text-xs uppercase text-(--foreground)/60">Confirmada el</p>
                                <p className="font-semibold">{formatDateTime(confirmedAt)}</p>
                            </div>
                        )}
                        {warehouseCen && (
                            <div>
                                <p className="text-xs uppercase text-(--foreground)/60">Almacen</p>
                                <p className="font-semibold">{warehouseCen}</p>
                            </div>
                        )}
                    </div>

                    {String(status).toLowerCase() === "pending" && (
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 rounded-lg bg-[#43206b] text-white"
                            disabled={confirmarCompra.isPending}
                        >
                            Confirmar compra
                        </button>
                    )}

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-(--background)">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <p className="font-semibold">Items</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-gray-200 dark:border-gray-800">
                                        <th className="p-3">Producto</th>
                                        <th className="p-3">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length ? (
                                        items.map((item, index) => {
                                            const productCen = getField(item, "productCen", "ProductCen", "productId");
                                            const qty = getField(item, "quantity", "Quantity");
                                            const product = productMap.get(String(productCen));
                                            return (
                                                <tr key={`${productCen}-${index}`} className="border-b border-gray-100 dark:border-gray-900">
                                                    <td className="p-3">
                                                        {product
                                                            ? `${getField(product, "name", "Name", "nombre", "Nombre")} (${getField(product, "sku", "Sku")})`
                                                            : `ID ${productCen}`}
                                                    </td>
                                                    <td className="p-3">{qty}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td className="p-3 text-sm text-gray-500" colSpan={2}>
                                                No hay items para esta compra.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
