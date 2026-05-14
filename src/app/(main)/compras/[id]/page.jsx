"use client";

import Link from "next/link";
import { useMemo, use } from "react";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useCompra, useConfirmarCompra } from "@/hooks/useCompras";
import { useProductos } from "@/hooks/useProductos";
import { formatDateTime, cn } from "@/lib/utils";

export default function CompraDetallePage({ params }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { data: compra, isLoading } = useCompra(id);
    const { data: productos = [] } = useProductos();
    const confirmarCompra = useConfirmarCompra();

    const productMap = useMemo(() => {
        const map = new Map();
        productos.forEach((p) => map.set(String(p.idProducto), p));
        return map;
    }, [productos]);

    const onConfirm = () => {
        confirmarCompra.mutate(id);
    };

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
                    <p className="text-sm text-(--foreground)/70 mt-1">Compra #{id}</p>
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
                            <p className="font-semibold">{compra.supplier}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-(--foreground)/60">Fecha</p>
                            <p className="font-semibold">{formatDateTime(compra.date)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-(--foreground)/60">Estado</p>
                            <p className="font-semibold">{compra.status}</p>
                        </div>
                    </div>

                    {String(compra.status).toLowerCase() === "pending" && (
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
                                        <th className="p-3">Almacen</th>
                                        <th className="p-3">Cantidad</th>
                                        <th className="p-3">Empresa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compra.items?.length ? (
                                        compra.items.map((item, index) => {
                                            const product = productMap.get(String(item.productId));
                                            return (
                                                <tr key={`${item.productId}-${index}`} className="border-b border-gray-100 dark:border-gray-900">
                                                    <td className="p-3">
                                                        {product ? `${product.nombre} (${product.sku})` : `ID ${item.productId}`}
                                                    </td>
                                                    <td className="p-3">{item.almacenId}</td>
                                                    <td className="p-3">{item.quantity}</td>
                                                    <td className="p-3">{item.empresaId}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td className="p-3 text-sm text-gray-500" colSpan={4}>
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
