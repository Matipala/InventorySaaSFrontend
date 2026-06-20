"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import apiVentas from "@/lib/apiVentas";
import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from "@microsoft/signalr";
import { Coffee, Utensils, Clock, User, ClipboardList } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useEmpresa } from "@/context/EmpresaContext";

let globalConnection = null;

export default function KdsPage() {
    const { empresaId } = useEmpresa();
    const [items, setItems] = useState([]);
    const [estacion, setEstacion] = useState("COCINA");
    const [loading, setLoading] = useState(true);
    const { data: productos = [] } = useProductos();

    const fetchKdsRef = useRef(null);

    const fetchKds = useCallback(async () => {
        if (!empresaId) return;
        try {
            const teamCen = estacion === "COCINA" ? "team-1" : "team-2";
            const r = await apiVentas.get(`/api/sales/companies/${empresaId}/kds/teams/${teamCen}/items`);
            setItems(r.data);
        } catch (e) {
            console.error("Error fetching KDS", e);
        } finally {
            setLoading(false);
        }
    }, [empresaId, estacion]);

    useEffect(() => {
        fetchKdsRef.current = fetchKds;
    }, [fetchKds]);

    useEffect(() => {
        fetchKds();
    }, [fetchKds]);

    useEffect(() => {
        if (!empresaId) return;

        if (globalConnection && globalConnection.state === HubConnectionState.Connected) {
            globalConnection.invoke("SubscribeToEmpresa", empresaId).catch(console.error);
        } else if (!globalConnection || globalConnection.state === HubConnectionState.Disconnected) {

            let baseUrl = process.env.NEXT_PUBLIC_VENTAS_API_URL || "";
            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
            const hubUrl = `${baseUrl}/api/ventas/hubs/kds`;

            globalConnection = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Error)
                .build();

            globalConnection.on("UpdateKds", () => {
                if (fetchKdsRef.current) fetchKdsRef.current();
            });

            const startConnection = async () => {
                try {
                    await globalConnection.start();
                    await globalConnection.invoke("SubscribeToEmpresa", empresaId);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error("Error al iniciar SignalR:", err);
                    }
                }
            };

            startConnection();
        }
    }, [empresaId]);

    const itemsFiltrados = items.filter(it => {
        const prod = productos.find(p => (p.idProducto || p.IdProducto || p.productCen || p.ProductCen) === (it.productCen || it.ProductCen || it.idProducto));
        const prodEstacion = (prod?.estacion || prod?.Estacion || prod?.stationCode || prod?.StationCode || "COCINA").toUpperCase();
        return prodEstacion === estacion.toUpperCase();
    });

    const handleCambiarEstado = async (id, nuevoEstado) => {
        const itemsPrevios = [...items];
        setItems(actuales =>
            actuales.map(item =>
                (item.ticketItemCen || item.TicketItemCen || item.idCuentaTicketItem) === id
                    ? { ...item, status: nuevoEstado, estadoComanda: nuevoEstado }
                    : item
            )
        );

        try {
            await apiVentas.patch(`/api/sales/companies/${empresaId}/kds/items/${id}/status`, { status: nuevoEstado });
        } catch (e) {
            alert("Error al actualizar estado");
            setItems(itemsPrevios);
        }
    };

    const getField = (obj, ...keys) => {
        for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return null;
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between bg-(--background) p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {estacion === "COCINA" ? <Utensils /> : <Coffee />}
                        KDS - {estacion}
                    </h1>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setEstacion("COCINA")}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${estacion === "COCINA" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Cocina
                        </button>
                        <button
                            onClick={() => setEstacion("BAR")}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${estacion === "BAR" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Bar
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {itemsFiltrados.map(it => {
                    const id = getField(it, "ticketItemCen", "TicketItemCen", "idCuentaTicketItem");
                    const status = getField(it, "status", "Status", "estadoComanda");
                    const numero = getField(it, "dailyNumber", "DailyNumber", "numero");
                    const createdAt = getField(it, "createdAt", "CreatedAt", "fechaCreacion", "FechaCreacion");
                    const productCen = getField(it, "productCen", "ProductCen", "idProducto");
                    const quantity = getField(it, "quantity", "Quantity", "cantidad");
                    const note = getField(it, "note", "Note", "nota");

                    const prod = productos.find(p =>
                        (p.idProducto || p.IdProducto || p.productCen || p.ProductCen) === productCen
                    );
                    const nombreProd = prod?.nombre || prod?.Nombre || prod?.name || prod?.Name || `Producto ${productCen}`;

                    return (
                        <div
                            key={id}
                            className={`bg-(--background) border-l-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2 animate-in fade-in duration-500 ${status === "PREPARACION" || status === "preparing" ? "border-l-orange-500" :
                                status === "LISTO" || status === "delivered" ? "border-l-green-500 bg-green-50/10" :
                                    "border-l-blue-500"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-black px-2 py-0.5 rounded">
                                    TICKET #{numero || id?.slice(0, 8)}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} /> {createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>

                            <div className="flex-1 mt-1">
                                <p className="font-bold text-lg leading-tight uppercase">
                                    {nombreProd}
                                </p>
                                <p className="text-2xl font-black text-purple-600 mt-1">x{quantity}</p>

                                <div className="mt-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${status === "PREPARACION" || status === "preparing" ? "bg-orange-100 text-orange-700" :
                                        status === "LISTO" || status === "delivered" ? "bg-green-100 text-green-700" :
                                            "bg-blue-100 text-blue-700"
                                        }`}>
                                        {status === "LISTO" || status === "delivered" ? "✓ Listo para retirar" : status}
                                    </span>
                                </div>

                                {note && (
                                    <div className="mt-3 p-2 bg-violet-50 dark:bg-violet-900/20 border-l-2 border-l-violet-400 rounded-sm">
                                        <p className="text-sm font-semibold text-black dark:text-white">NOTA:</p>
                                        <p className="text-sm text-black dark:text-white font-bold">{note}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {status === "PENDIENTE" || status === "pending" || status === "created" ? (
                                    <button
                                        onClick={() => handleCambiarEstado(id, "PREPARACION")}
                                        className="w-full bg-violet-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-violet-700"
                                    >
                                        Empezar Preparación
                                    </button>
                                ) : null}
                                {status === "PREPARACION" || status === "preparing" ? (
                                    <button
                                        onClick={() => handleCambiarEstado(id, "LISTO")}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                                    >
                                        Listo
                                    </button>
                                ) : null}
                                {status === "LISTO" || status === "delivered" ? (
                                    <div className="text-center text-green-600 font-bold text-xs py-2">
                                        ¡Listo!
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}

                {itemsFiltrados.length === 0 && !loading && (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-400 py-32 space-y-4">
                        <ClipboardList size={64} className="opacity-20" />
                        <p className="text-xl font-bold opacity-30">No hay pedidos pendientes en {estacion}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
