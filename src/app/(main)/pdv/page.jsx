"use client";

import { ShoppingCart, User, Plus, ClipboardList } from "lucide-react";
import { useState } from "react";
import {
    useCrearCuentaTicket,
    useAgregarItemCuentaTicket,
    usePagarCuentaTicket,
    useCuentaTicketById,
    useCuentasAbiertas,
    useEnviarComanda,
    useActualizarMesero,
    useCancelarCuentaTicket,
    useReenviarComanda
} from "@/hooks/useCuentasTickets";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";

export default function PdvPage() {
    const [cuentaId, setCuentaId] = useState(null);
    const [mesero, setMesero] = useState("");
    const [editandoMesero, setEditandoMesero] = useState(false);
    const [nuevoMesero, setNuevoMesero] = useState("");
    const [item, setItem] = useState({ idProducto: "", cantidad: 1, nota: "" });
    const [pago, setPago] = useState({ monto: "" });

    const crearCuenta = useCrearCuentaTicket();
    const agregarItem = useAgregarItemCuentaTicket(cuentaId);
    const pagarCuenta = usePagarCuentaTicket(cuentaId);
    const enviarComanda = useEnviarComanda(cuentaId);
    const actualizarMesero = useActualizarMesero(cuentaId);
    const cancelarCuenta = useCancelarCuentaTicket(cuentaId);
    const reenviarComanda = useReenviarComanda(cuentaId);

    const { data: cuenta } = useCuentaTicketById(cuentaId);
    const { data: cuentasAbiertas = [], isLoading: loadingAbiertas } = useCuentasAbiertas();
    const { data: productos = [] } = useProductos();
    const { data: almacenes = [] } = useAlmacenes();

    const handleCrearCuenta = async () => {
        if (!mesero.trim()) {
            alert("El nombre del mesero es obligatorio.");
            return;
        }
        if (almacenes.length === 0) {
            alert("No hay almacenes configurados.");
            return;
        }

        try {
            const data = await crearCuenta.mutateAsync({
                idAlmacen: almacenes[0].idAlmacen,
                mesero: mesero
            });
            setCuentaId(data.idCuentaTicket);
            setMesero("");
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleAgregarItem = async (e) => {
        e.preventDefault();
        const selectedProd = productos.find(p => p.idProducto === parseInt(item.idProducto));
        if (!selectedProd) return;
        if (!cuentaId) {
            alert("Seleccione una cuenta primero.");
            return;
        }

        try {
            await agregarItem.mutateAsync({
                idCuentaTicket: cuentaId,
                idProducto: parseInt(item.idProducto),
                cantidad: item.cantidad,
                precioUnitario: selectedProd.precioVenta,
                nota: item.nota
            });
            setItem({ idProducto: "", cantidad: 1, nota: "" });
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleEnviarComanda = async () => {
        if (!cuentaId) return;

        const comEnviada = cuenta?.items?.some(i => i.estadoComanda && i.estadoComanda !== 'NUEVO');

        try {
            if (comEnviada) {
                await reenviarComanda.mutateAsync(Number(cuentaId));
                alert("Comanda reenviada.");
            } else {
                await enviarComanda.mutateAsync(Number(cuentaId));
                alert("Comanda enviada con éxito.");
            }
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleActualizarMesero = async () => {
        try {
            await actualizarMesero.mutateAsync(nuevoMesero);
            setEditandoMesero(false);
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleCancelarCuenta = async () => {
        if (!cuentaId) return;

        try {
            await cancelarCuenta.mutateAsync(Number(cuentaId));
            setCuentaId(null);
            alert("Cuenta cancelada.");
        } catch (e) {
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    const handleImprimirTicket = () => {
        window.print();
    };

    const handlePagar = async (e) => {
        e.preventDefault();
        if (!cuentaId) return;
        try {
            await pagarCuenta.mutateAsync({
                idCuentaTicket: cuentaId,
                ...pago,
                metodoPago: "EFECTIVO"
            });
            setCuentaId(null);
            setPago({ monto: "" });
            alert("Pago procesado con éxito.");
        } catch (e) {
            console.error("Error al procesar pago:", e);
            alert(e.response?.data?.mensaje || e.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            {/* Sidebar Cuentas Abiertas */}
            <div className="lg:col-span-1 bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-2 font-bold text-lg mb-2">
                    <ClipboardList size={20} />
                    <span>Cuentas Abiertas</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {loadingAbiertas ? <p>Cargando...</p> : (
                        cuentasAbiertas.map(c => (
                            <button
                                key={c.idCuentaTicket}
                                onClick={() => setCuentaId(c.idCuentaTicket)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${cuentaId === c.idCuentaTicket
                                    ? "bg-purple-100 border-purple-500 dark:bg-purple-900/30"
                                    : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <div className="flex justify-between font-semibold">
                                    <span>#{c.numero}</span>
                                    <span>Bs {c.total.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <User size={12} /> {c.mesero}
                                </div>
                            </button>
                        ))
                    )}
                    {cuentasAbiertas.length === 0 && !loadingAbiertas && (
                        <p className="text-center text-gray-500 py-10">No hay cuentas abiertas</p>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Nuevo Ticket</label>
                    <div className="space-y-2">
                        <input
                            placeholder="Nombre del mesero..."
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                            value={mesero}
                            onChange={e => setMesero(e.target.value)}
                        />
                        <button
                            onClick={handleCrearCuenta}
                            disabled={crearCuenta.isLoading}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
                        >
                            <Plus size={18} /> Abrir Cuenta
                        </button>
                    </div>
                </div>
            </div>

            {/* Area Central: Detalle de Cuenta y Productos */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">

                {/* Lista de Items */}
                <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={20} className="text-purple-600" />
                                <h2 className="font-bold">
                                    {cuentaId ? `Cuenta #${cuenta?.numero}` : "Seleccione una cuenta"}
                                </h2>
                            </div>
                            {cuentaId && (
                                <div className="flex items-center gap-2 mt-1 px-1">
                                    <User size={12} className="text-gray-400" />
                                    {editandoMesero ? (
                                        <div className="flex gap-1">
                                            <input
                                                className="text-xs border rounded px-1.5 py-0.5 bg-transparent"
                                                value={nuevoMesero}
                                                onChange={e => setNuevoMesero(e.target.value)}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleActualizarMesero}
                                                className="text-[10px] bg-green-600 text-white px-1.5 rounded"
                                            >
                                                Ok
                                            </button>
                                            <button
                                                onClick={() => setEditandoMesero(false)}
                                                className="text-[10px] bg-gray-500 text-white px-1.5 rounded"
                                            >
                                                x
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-medium">{cuenta?.mesero}</span>
                                            <button
                                                onClick={() => {
                                                    setNuevoMesero(cuenta?.mesero || "");
                                                    setEditandoMesero(true);
                                                }}
                                                className="text-[10px] text-purple-600 hover:underline font-bold"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {cuentaId && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEnviarComanda}
                                    disabled={enviarComanda.isLoading || reenviarComanda.isLoading}
                                    className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-orange-200"
                                >
                                    {cuenta?.items?.some(i => i.estadoComanda && i.estadoComanda !== 'NUEVO') ? 'Reenviar' : 'Enviar'} Comanda
                                </button>
                                {cuenta?.estado === "ABIERTO" && (
                                    <button
                                        onClick={handleCancelarCuenta}
                                        disabled={cancelarCuenta.isLoading}
                                        className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-red-200"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cuenta?.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-start border-b border-gray-50 dark:border-gray-900 pb-3">
                                <div className="space-y-1">
                                    <p className="font-semibold">{it.producto?.nombre || `Producto ${it.idProducto}`} x{it.cantidad}</p>
                                    {it.nota && <p className="text-xs text-orange-600 dark:text-orange-400 italic bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Nota: {it.nota}</p>}
                                    <div className="flex gap-2 text-[10px] uppercase font-bold mt-1">
                                        {it.estadoComanda === 'NUEVO' || !it.estadoComanda ? (
                                            <span className="text-gray-400">Por enviar</span>
                                        ) : (
                                            <span className={`px-2 py-0.5 rounded-full ${it.estadoComanda === 'PENDIENTE' ? 'bg-blue-100 text-blue-700' :
                                                it.estadoComanda === 'PREPARACION' ? 'bg-orange-100 text-orange-700' :
                                                    it.estadoComanda === 'LISTO' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {it.estadoComanda === 'PENDIENTE' ? 'Pendiente' :
                                                    it.estadoComanda === 'PREPARACION' ? 'En Cocina' :
                                                        it.estadoComanda === 'LISTO' ? 'Listo' : it.estadoComanda}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="font-mono text-sm leading-6">Bs {it.subtotal.toFixed(2)}</p>
                            </div>
                        ))}
                        {!cuentaId && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2 py-20">
                                <Plus size={48} />
                                <p>Cree o seleccione una cuenta para comenzar</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>Bs {cuenta?.subtotal?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Impuesto</span>
                            <span>Bs {cuenta?.impuesto?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-1 border-t border-gray-200 dark:border-gray-700">
                            <span>Total</span>
                            <span className="text-purple-600">Bs {cuenta?.total?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                </div>

                {/* Controles: Agregar y Pagar */}
                <div className="space-y-6">
                    {/* Agregar Ítem */}
                    <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Plus size={18} /> Agregar al Pedido
                        </h3>
                        <form onSubmit={handleAgregarItem} className="space-y-3">
                            <select
                                className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                value={item.idProducto}
                                onChange={e => setItem(i => ({ ...i, idProducto: e.target.value }))}
                                disabled={!cuentaId}
                                required
                            >
                                <option value="">Seleccione un producto...</option>
                                {productos
                                    .filter(p => p.activo && !p.agotado86)
                                    .map(p => (
                                        <option key={p.idProducto} value={p.idProducto}>
                                            {p.nombre} - Bs {p.precioVenta.toFixed(2)}
                                        </option>
                                    ))}
                            </select>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Cantidad</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                        value={item.cantidad}
                                        onChange={e => setItem(i => ({ ...i, cantidad: Number(e.target.value) }))}
                                        disabled={!cuentaId}
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Nota / Instrucciones</label>
                                    <input
                                        placeholder="Ej: Sin sal, término medio..."
                                        className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                        value={item.nota}
                                        onChange={e => setItem(i => ({ ...i, nota: e.target.value }))}
                                        disabled={!cuentaId}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!cuentaId || agregarItem.isLoading}
                                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {agregarItem.isLoading ? "Agregando..." : "Agregar Ítem"}
                            </button>
                        </form>
                    </div>

                    {/* Pago */}
                    <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            Registrar Pago
                        </h3>
                        <form onSubmit={handlePagar} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Efectivo Recibido (Bs)</label>
                                <input
                                    type="number"
                                    step="any"
                                    min={cuenta?.total || 0}
                                    placeholder="0.00"
                                    className="w-full border rounded-lg px-3 py-2 text-lg font-mono bg-transparent"
                                    value={pago.monto}
                                    onChange={e => setPago({ monto: e.target.value })}
                                    disabled={!cuentaId || (cuenta?.items?.length === 0)}
                                    required
                                />
                                {Number(pago.monto) >= (cuenta?.total || 0) && cuenta?.total > 0 && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm flex justify-between">
                                        <span>Cambio:</span>
                                        <span className="font-bold">Bs {(Number(pago.monto) - cuenta.total).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!cuentaId || pagarCuenta.isLoading || (cuenta?.items?.length === 0)}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {pagarCuenta.isLoading ? "Procesando..." : "Pagar y Cerrar Cuenta"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
