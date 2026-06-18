"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import apiVentas from "@/lib/apiVentas";
import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from "@microsoft/signalr";
import { Coffee, Utensils, Clock, User, ClipboardList } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useEmpresa } from "@/context/EmpresaContext";

// Singleton global para la conexión de SignalR
let globalConnection = null;

export default function KdsPage() {
    const { empresaId } = useEmpresa();
    const [items, setItems] = useState([]);
    const [estacion, setEstacion] = useState("COCINA"); 
    const [loading, setLoading] = useState(true);
    const { data: productos = [] } = useProductos();

    // Referencia para evitar que los callbacks usen estados viejos
    const fetchKdsRef = useRef(null);

    const fetchKds = useCallback(async () => {
        if (!empresaId) return;
        try {
            const r = await apiVentas.get(`/api/sales/companies/${empresaId}/kds/${estacion}`);
            setItems(r.data);
        } catch (e) {
            console.error("Error fetching KDS", e);
        } finally {
            setLoading(false);
        }
    }, [empresaId, estacion]);

    // Actualizamos la referencia cada vez que fetchKds cambie
    useEffect(() => {
        fetchKdsRef.current = fetchKds;
    }, [fetchKds]);

    // Efecto 1: Carga inicial de datos
    useEffect(() => {
        fetchKds();
    }, [fetchKds]);

    // Efecto 2: Gestión de SignalR (Singleton)
    useEffect(() => {
        if (!empresaId) return;

        // Si ya hay una conexión y está activa, solo nos aseguramos de estar suscritos
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
                .configureLogging(LogLevel.Error) // Solo errores para limpiar la consola
                .build();

            globalConnection.on("UpdateKds", () => {
                console.log("KDS SignalR: Señal recibida, recargando...");
                if (fetchKdsRef.current) fetchKdsRef.current();
            });

            const startConnection = async () => {
                try {
                    await globalConnection.start();
                    console.log("KDS SignalR: Conexión establecida");
                    await globalConnection.invoke("SubscribeToEmpresa", empresaId);
                } catch (err) {
                    // Ignoramos el error de negociación abortada ya que el reconector lo manejará
                    if (err.name !== 'AbortError') {
                        console.error("Error al iniciar SignalR:", err);
                    }
                }
            };

            startConnection();
        }

        // NO cerramos la conexión al desmontar para evitar el error de negociación.
        // SignalR se mantendrá vivo mientras el usuario navegue en la app.
    }, [empresaId]);

    // Filtrar ítems por la estación del producto
    const itemsFiltrados = items.filter(it => {
        const prod = productos.find(p => (p.idProducto || p.IdProducto) === it.idProducto);
        const prodEstacion = (prod?.estacion || prod?.Estacion || "COCINA").toUpperCase();
        return prodEstacion === estacion.toUpperCase();
    });

    const handleCambiarEstado = async (id, nuevoEstado) => {
        const itemsPrevios = [...items];
        setItems(actuales =>
            actuales.map(item =>
                item.idCuentaTicketItem === id ? { ...item, estadoComanda: nuevoEstado } : item
            )
        );

        try {
            await apiVentas.patch(`/api/sales/companies/${empresaId}/kds/items/${id}/status`, { nuevoEstado });
        } catch (e) {
            alert("Error al actualizar estado");
            setItems(itemsPrevios);
        }
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
                {itemsFiltrados.map(it => (
                    <div
                        key={it.idCuentaTicketItem}
                        className={`bg-(--background) border-l-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2 animate-in fade-in duration-500 ${it.estadoComanda === "PREPARACION" ? "border-l-orange-500" :
                            it.estadoComanda === "LISTO" ? "border-l-green-500 bg-green-50/10" :
                                "border-l-blue-500"
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-black px-2 py-0.5 rounded">
                                TICKET #{it.numero || it.Numero}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {new Date(it.fechaCreacion || it.FechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className="flex-1 mt-1">
                            <p className="font-bold text-lg leading-tight uppercase">
                                {productos.find(p => (p.idProducto || p.IdProducto) === it.idProducto)?.nombre || `Producto ${it.idProducto}`}
                            </p>
                            <p className="text-2xl font-black text-purple-600 mt-1">x{it.cantidad || it.Cantidad}</p>

                            <div className="mt-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${it.estadoComanda === "PREPARACION" ? "bg-orange-100 text-orange-700" :
                                    it.estadoComanda === "LISTO" ? "bg-green-100 text-green-700" :
                                        "bg-blue-100 text-blue-700"
                                    }`}>
                                    {it.estadoComanda === "LISTO" ? "✓ Listo para retirar" : it.estadoComanda}
                                </span>
                            </div>

                            {(it.nota || it.Nota) && (
                                <div className="mt-3 p-2 bg-violet-50 dark:bg-violet-900/20 border-l-2 border-l-violet-400 rounded-sm">
                                    <p className="text-sm font-semibold text-black dark:text-white">NOTA:</p>
                                    <p className="text-sm text-black dark:text-white font-bold">{it.nota || it.Nota}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            {it.estadoComanda === "PENDIENTE" && (
                                <button
                                    onClick={() => handleCambiarEstado(it.idCuentaTicketItem, "PREPARACION")}
                                    className="w-full bg-violet-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-violet-700"
                                >
                                    Empezar Preparación
                                </button>
                            )}
                            {it.estadoComanda === "PREPARACION" && (
                                <button
                                    onClick={() => handleCambiarEstado(it.idCuentaTicketItem, "LISTO")}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                                >
                                    Listo
                                </button>
                            )}
                            {it.estadoComanda === "LISTO" && (
                                <div className="text-center text-green-600 font-bold text-xs py-2">
                                    ¡Listo!
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center gap-2 text-xs text-gray-500">
                            <User size={14} /> Mesero: <span className="font-bold text-gray-700 dark:text-gray-300">{it.mesero || it.Mesero}</span>
                        </div>
                    </div>
                ))}

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
