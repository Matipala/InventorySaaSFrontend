"use client";

import { ShoppingCart, User, Plus, ClipboardList, CheckCircle2, CheckCircle, AlertCircle } from "lucide-react";
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
    useReenviarComanda,
    useWaiters,
    usePaymentMethods,
    useTicketItems
} from "@/hooks/useCuentasTickets";
import { useProductos } from "@/hooks/useProductos";
import { useAlmacenes } from "@/hooks/useAlmacenes";
import { AlertError } from "@/components/ui/AlertError";

export default function PdvPage() {
    const [cuentaId, setCuentaId] = useState(null);
    const [mesero, setMesero] = useState("");
    const [item, setItem] = useState({ idProducto: "", cantidad: 1, nota: "" });
    const [pago, setPago] = useState({ monto: "", metodo: 1 });
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [editandoMesero, setEditandoMesero] = useState(false);
    const [nuevoMesero, setNuevoMesero] = useState("");

    const crearCuenta = useCrearCuentaTicket();
    const agregarItem = useAgregarItemCuentaTicket(cuentaId);
    const pagarCuenta = usePagarCuentaTicket(cuentaId);
    const enviarComanda = useEnviarComanda(cuentaId);
    const actualizarMesero = useActualizarMesero(cuentaId);
    const cancelarCuenta = useCancelarCuentaTicket(cuentaId);
    const reenviarComanda = useReenviarComanda(cuentaId);

    const { data: cuenta, isLoading: loadingCuenta } = useCuentaTicketById(cuentaId);
    const { data: ticketItems = [] } = useTicketItems(cuentaId);
    const { data: cuentasAbiertas = [], isLoading: loadingAbiertas } = useCuentasAbiertas();
    const { data: productos = [] } = useProductos();
    const { data: almacenes = [] } = useAlmacenes();
    const { data: waiters = [] } = useWaiters();
    const { data: paymentMethods = [] } = usePaymentMethods();

    const handleCrearCuenta = async () => {
        if (!mesero.trim()) {
            setError("El nombre del mesero es obligatorio.");
            return;
        }

        try {
            setError("");
            
            let idAlmacen = localStorage.getItem("warehouseCen");
            if (!idAlmacen) {
                if (almacenes && almacenes.length > 0) {
                    const primerAlmacen = almacenes[0];
                    idAlmacen = primerAlmacen.idAlmacen || primerAlmacen.IdAlmacen || primerAlmacen.warehouseCen || primerAlmacen.WarehouseCen;
                } else {
                    idAlmacen = "WH-MAIN-001"; // Default seeded warehouse
                }
                localStorage.setItem("warehouseCen", idAlmacen);
            }
            
            const data = await crearCuenta.mutateAsync({
                warehouseCen: idAlmacen,
                waiterCen: mesero
            });
            setCuentaId(data.ticketCen || data.TicketCen);
            setMesero("");
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handleAgregarItem = async (e) => {
        e.preventDefault();
        const selectedProd = productos.find(p => (p.idProducto || p.IdProducto || p.productCen || p.ProductCen) === item.idProducto);
        if (!selectedProd) return;
        if (!cuentaId) {
            setError("Seleccione una cuenta primero.");
            return;
        }

        try {
            setError("");
            await agregarItem.mutateAsync({
                productCen: item.idProducto,
                quantity: item.cantidad,
                note: item.nota
            });
            setItem({ idProducto: "", cantidad: 1, nota: "" });
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handleEnviarComanda = async () => {
        if (!cuentaId) return;
        try {
            setError("");
            await enviarComanda.mutateAsync();
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handleReenviarComanda = async () => {
        if (!cuentaId) return;
        if (!confirm("¿Desea reenviar toda la comanda a cocina?")) return;
        try {
            setError("");
            await reenviarComanda.mutateAsync();
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handleActualizarMesero = async () => {
        if (!nuevoMesero.trim()) return;
        try {
            await actualizarMesero.mutateAsync(nuevoMesero);
            setEditandoMesero(false);
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handleCancelarCuenta = async () => {
        if (!cuentaId) return;
        if (!confirm("¿Seguro que desea cancelar esta cuenta? Esta acción no se puede deshacer.")) return;
        try {
            await cancelarCuenta.mutateAsync();
            setCuentaId(null);
        } catch (e) {
            setError(e.response?.data?.mensaje || e.message);
        }
    };

    const handlePagar = async (e) => {
        e.preventDefault();
        if (!cuentaId) return;
        
        const total = cuenta?.total || cuenta?.Total || 0;
        if (Number(pago.monto) < total) {
            setError("El monto recibido debe ser mayor o igual al total.");
            return;
        }

        try {
            setError("");
            console.log("Iniciando proceso de pago para cuenta:", cuentaId);
            await pagarCuenta.mutateAsync({
                idCuentaTicket: cuentaId,
                paymentMethodId: Number(pago.metodo)
            });
            console.log("Pago exitoso");
            setToast({ type: "success", msg: "Cuenta pagada y cerrada con éxito." });
            setCuentaId(null);
            setPago({ monto: "", metodo: 1 });
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            console.error("Error al procesar pago:", e);
            setError(e.response?.data?.detail || e.response?.data?.mensaje || e.message || "Error al procesar el pago");
        }
    };

    const itemsCuenta = ticketItems;
    const subtotal = cuenta?.subTotal || cuenta?.SubTotal || 0;
    const impuesto = cuenta?.taxAmount || cuenta?.TaxAmount || 0;
    const total = cuenta?.total || cuenta?.Total || 0;
    const numeroCuenta = cuenta?.ticketCen || cuenta?.TicketCen;
    const meseroCuenta = cuenta?.waiterName || cuenta?.WaiterName;
    const statusCuenta = cuenta?.status || cuenta?.Status || "open";
    const isCuentaCerrada = statusCuenta.toLowerCase() !== "open";

    const allTickets = cuentasAbiertas || [];
    const openTickets = allTickets.filter(c => {
        const s = c.status || c.Status;
        return s && s.toLowerCase() === "open";
    });
    const closedTickets = allTickets.filter(c => {
        const s = c.status || c.Status;
        return s && s.toLowerCase() !== "open";
    });

    return (
        <div className="space-y-4">
            <AlertError error={error} />
            {toast && (
                <div
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                        toast.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
                {/* Sidebar Cuentas Abiertas */}
                <div className="lg:col-span-1 bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-2 font-bold text-lg mb-2">
                        <ClipboardList size={20} />
                        <span>Cuentas Abiertas</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loadingAbiertas ? <p>Cargando...</p> : (
                            <>
                                {openTickets.map(c => {
                                    const idC = c.ticketCen || c.TicketCen;
                                    const numC = c.ticketCen || c.TicketCen;
                                    const totalC = c.total || c.Total || 0;
                                    const meseroC = c.waiterName || c.WaiterName;
                                    return (
                                        <button
                                            key={idC}
                                            onClick={() => {
                                                setError("");
                                                setCuentaId(idC);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${cuentaId === idC
                                                ? "bg-purple-100 border-purple-500 dark:bg-purple-900/30"
                                                : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            <div className="flex justify-between font-semibold">
                                                <span>#{numC}</span>
                                                <span>Bs {Number(totalC).toFixed(2)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                <User size={12} /> {meseroC}
                                            </div>
                                        </button>
                                    );
                                })}
                                {openTickets.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No hay cuentas abiertas</p>
                                )}

                                {closedTickets.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 font-bold text-sm mb-2 text-gray-500">
                                            <ClipboardList size={16} />
                                            <span>Cuentas Cerradas</span>
                                        </div>
                                        <div className="space-y-2">
                                            {closedTickets.map(c => {
                                                const idC = c.ticketCen || c.TicketCen;
                                                const numC = c.ticketCen || c.TicketCen;
                                                const totalC = c.total || c.Total || 0;
                                                const meseroC = c.waiterName || c.WaiterName;
                                                const statusC = c.status || c.Status;
                                                return (
                                                    <button
                                                        key={idC}
                                                        onClick={() => {
                                                            setError("");
                                                            setCuentaId(idC);
                                                        }}
                                                        className={`w-full text-left p-2 rounded-lg border transition-all opacity-75 hover:opacity-100 ${cuentaId === idC
                                                            ? "bg-gray-200 border-gray-400 dark:bg-gray-800/80"
                                                            : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between font-semibold text-sm">
                                                            <span className="line-through text-gray-500">#{numC}</span>
                                                            <span>Bs {Number(totalC).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                                            <div className="flex items-center gap-1"><User size={10} /> {meseroC}</div>
                                                            <span className="uppercase">{statusC}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Nuevo Ticket</label>
                        <div className="space-y-2">
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                                value={mesero}
                                onChange={e => setMesero(e.target.value)}
                            >
                                <option value="">Mesero...</option>
                                {waiters.map(w => (
                                    <option key={w.waiterCen || w.WaiterCen} value={w.waiterCen || w.WaiterCen}>
                                        {w.name || w.Name}
                                    </option>
                                ))}
                                {waiters.length === 0 && <option value="">Escribe un mesero...</option>}
                            </select>
                            {waiters.length === 0 && (
                                <input
                                    placeholder="Nombre del mesero..."
                                    className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                                    value={mesero}
                                    onChange={e => setMesero(e.target.value)}
                                />
                            )}
                            <button
                                onClick={handleCrearCuenta}
                                disabled={crearCuenta.isPending}
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
                                        {cuentaId ? `Cuenta #${numeroCuenta}` : "Seleccione una cuenta"}
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
                                                <span className="text-xs text-gray-500 font-medium">{meseroCuenta}</span>
                                                <button
                                                    onClick={() => {
                                                        setNuevoMesero(meseroCuenta || "");
                                                        setEditandoMesero(true);
                                                    }}
                                                    disabled={isCuentaCerrada}
                                                    className="text-[10px] text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {cuentaId && !isCuentaCerrada && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleReenviarComanda}
                                        className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold hover:bg-orange-200"
                                    >
                                        Reenviar Cocina
                                    </button>
                                    <button
                                        onClick={handleCancelarCuenta}
                                        className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold hover:bg-red-200"
                                    >
                                        Anular
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {itemsCuenta.map((it, idx) => {
                                const idIt = it.ticketItemCen || it.TicketItemCen || it.idCuentaTicketItem || it.IdCuentaTicketItem || idx;
                                const nomP = it.productName || it.ProductName || it.nombre || it.Nombre || `Producto ${it.productCen || it.ProductCen || it.idProducto}`;
                                const cantIt = it.quantity || it.Quantity || it.cantidad || it.Cantidad;
                                const subIt = it.subTotal || it.SubTotal || it.subtotal || it.Subtotal || ((it.unitPrice || it.UnitPrice || 0) * (cantIt || 0));
                                const estIt = it.status || it.Status || it.estadoComanda || it.EstadoComanda;
                                
                                return (
                                    <div key={idIt} className="flex justify-between items-start border-b border-gray-50 dark:border-gray-900 pb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm uppercase">{nomP}</p>
                                            <p className="text-xs text-gray-500 italic">{it.nota || it.Nota}</p>
                                            <span className={`text-[10px] font-bold px-1.5 rounded ${estIt === "PENDIENTE" ? "bg-orange-100 text-orange-700" :
                                                    estIt === "LISTO" ? "bg-green-100 text-green-700" :
                                                        "bg-blue-100 text-blue-700"
                                                }`}>
                                                {estIt}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">x{cantIt}</p>
                                            <p className="text-xs font-medium text-purple-600">Bs {Number(subIt).toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {itemsCuenta.length === 0 && !loadingCuenta && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-20">
                                    <ShoppingCart size={48} className="mb-2" />
                                    <p>Cuenta vacía</p>
                                </div>
                            )}
                        </div>

                        {cuentaId && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span>Bs {Number(subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Impuesto:</span>
                                    <span>Bs {Number(impuesto).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-purple-600 pt-1 border-t border-gray-200 dark:border-gray-700">
                                    <span>TOTAL:</span>
                                    <span>Bs {Number(total).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                        {/* Agregar Items */}
                        <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-green-600">
                                <Plus size={18} /> Agregar Productos
                            </h3>
                            <form onSubmit={handleAgregarItem} className="space-y-4">
                                <select
                                    className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                    value={item.idProducto}
                                    onChange={e => setItem(i => ({ ...i, idProducto: e.target.value }))}
                                    disabled={!cuentaId || isCuentaCerrada}
                                    required
                                >
                                    <option value="">Seleccione un producto...</option>
                                    {productos
                                        .filter(p => {
                                            const activo = p.activo !== undefined ? p.activo : (p.Activo !== undefined ? p.Activo : (p.status === "Activo" || p.Status === "Activo" || p.status === "Agotado" || p.Status === "Agotado"));
                                            const agotado = p.agotado86 !== undefined ? p.agotado86 : (p.Agotado86 !== undefined ? p.Agotado86 : (p.status === "Agotado" || p.Status === "Agotado"));
                                            return activo && !agotado;
                                        })
                                        .map(p => {
                                            const id = p.idProducto || p.IdProducto || p.productCen || p.ProductCen;
                                            const nom = p.nombre || p.Nombre || p.name || p.Name;
                                            const pre = p.precioVenta || p.PrecioVenta || p.salePrice || p.SalePrice || 0;
                                            return (
                                                <option key={id} value={id}>
                                                    {nom} - Bs {Number(pre).toFixed(2)}
                                                </option>
                                            );
                                        })}
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
                                            disabled={!cuentaId || isCuentaCerrada}
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
                                            disabled={!cuentaId || isCuentaCerrada}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={!item.idProducto || agregarItem.isPending || isCuentaCerrada}
                                        className="flex-1 bg-green-100 text-green-700 py-2.5 rounded-lg font-bold hover:bg-green-200 disabled:opacity-50 transition-colors"
                                    >
                                        {agregarItem.isPending ? "Agregando..." : "Agregar a la Cuenta"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEnviarComanda}
                                        disabled={!cuentaId || enviarComanda.isPending || itemsCuenta.length === 0 || isCuentaCerrada}
                                        className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {enviarComanda.isPending ? "Enviando..." : "Enviar Comanda a Cocina"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Pago */}
                        <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                Registrar Pago
                            </h3>
                            <form onSubmit={handlePagar} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Método de Pago</label>
                                    {paymentMethods.length > 0 ? (
                                        <select
                                            className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                            value={pago.metodo}
                                            onChange={e => setPago(p => ({ ...p, metodo: e.target.value }))}
                                        >
                                            {paymentMethods.map(m => (
                                                <option key={m.paymentMethodCode || m.PaymentMethodCode} value={m.id || m.Id}>
                                                    {m.name || m.Name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            className="w-full border rounded-lg px-3 py-2 bg-transparent"
                                            value={pago.metodo}
                                            onChange={e => setPago(p => ({ ...p, metodo: e.target.value }))}
                                        >
                                            <option value={1}>Efectivo</option>
                                            <option value={3}>Tarjeta</option>
                                            <option value={2}>Transferencia / QR</option>
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Efectivo Recibido (Bs)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min={total || 0}
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-lg font-mono bg-transparent focus:ring-2 focus:ring-blue-500"
                                        value={pago.monto}
                                        onChange={e => setPago(p => ({ ...p, monto: e.target.value }))}
                                        disabled={!cuentaId || itemsCuenta.length === 0}
                                        required
                                    />
                                    {Number(pago.monto) >= total && total > 0 && (
                                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm flex justify-between">
                                            <span>Cambio:</span>
                                            <span className="font-bold">Bs {(Number(pago.monto) - total).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!cuentaId || pagarCuenta.isPending || itemsCuenta.length === 0 || isCuentaCerrada}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
                                >
                                    {pagarCuenta.isPending ? (
                                        <>Procesando...</>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} />
                                            Pagar y Cerrar Cuenta
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
