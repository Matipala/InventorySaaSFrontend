"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import {
    useCrearCuentaTicket,
    useAgregarItemCuentaTicket,
    usePagarCuentaTicket,
    useCuentaTicketById
} from "@/hooks/useCuentasTickets";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";

export default function PdvPage() {
    const [cuentaId, setCuentaId] = useState(null);
    const [item, setItem] = useState({ idProducto: "", cantidad: 1 });
    const [pago, setPago] = useState({ monto: "" });
    const crearCuenta = useCrearCuentaTicket();
    const agregarItem = useAgregarItemCuentaTicket(cuentaId);
    const pagarCuenta = usePagarCuentaTicket(cuentaId);
    const { data: cuenta } = useCuentaTicketById(cuentaId);
    const { data: productos = [] } = useProductos();
    const { data: almacenes = [] } = useAlmacenes();

    const handleCrearCuenta = async () => {
        if (almacenes.length === 0) {
            alert("No hay almacenes configurados. Es necesario al menos uno.");
            return;
        }

        try {
            const data = await crearCuenta.mutateAsync({
                idAlmacen: almacenes[0].idAlmacen,
                mesero: "Cajero"
            });
            setCuentaId(data.idCuentaTicket || data.id || data.cuenta?.idCuentaTicket);
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleAgregarItem = async (e) => {
        e.preventDefault();
        try {
            await agregarItem.mutateAsync({ ...item });
        } catch (e) {
            alert(e.message);
        }
    };

    const handlePagar = async (e) => {
        e.preventDefault();
        try {
            await pagarCuenta.mutateAsync({ ...pago });
            setCuentaId(null);
            setItem({ idProducto: "", cantidad: 1 });
            setPago({ monto: "" });
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-(--foreground)">PDV</h1>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-(--background)">
                <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart size={18} />
                    <p className="font-semibold text-(--foreground)">Punto de venta</p>
                </div>
                {!cuentaId ? (
                    <button
                        className="px-4 py-2 bg-purple-600 text-white rounded"
                        onClick={handleCrearCuenta}
                        disabled={crearCuenta.isLoading}
                    >
                        {crearCuenta.isLoading ? "Creando..." : "Abrir nueva cuenta"}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h2 className="font-semibold">Cuenta #{cuentaId}</h2>
                            <ul className="text-sm mb-2">
                                {cuenta?.items?.map((it, idx) => (
                                    <li key={idx}>
                                        {it.nombreProducto || it.producto?.nombre} x{it.cantidad}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <form className="flex gap-2 items-end" onSubmit={handleAgregarItem}>
                            <select
                                className="border rounded px-2 py-1"
                                value={item.idProducto}
                                onChange={e => setItem(i => ({ ...i, idProducto: e.target.value }))}
                                required
                            >
                                <option value="">Producto...</option>
                                {productos
                                    .filter(p => p.activo && !p.agotado86)
                                    .map(p => (
                                        <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                                    ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                className="border rounded px-2 py-1 w-20"
                                value={item.cantidad}
                                onChange={e => setItem(i => ({ ...i, cantidad: Number(e.target.value) }))}
                                required
                            />
                            <button
                                type="submit"
                                className="px-3 py-1 bg-green-600 text-white rounded"
                                disabled={agregarItem.isLoading}
                            >
                                {agregarItem.isLoading ? "Agregando..." : "Agregar"}
                            </button>
                        </form>
                        <form className="flex gap-2 items-end" onSubmit={handlePagar}>
                            <input
                                type="number"
                                min={0}
                                className="border rounded px-2 py-1 w-32"
                                placeholder="Monto a pagar"
                                value={pago.monto}
                                onChange={e => setPago({ monto: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                disabled={pagarCuenta.isLoading}
                            >
                                {pagarCuenta.isLoading ? "Pagando..." : "Pagar y cerrar cuenta"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
