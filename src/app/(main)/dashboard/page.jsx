"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  PackageX,
  Package,
  ShoppingCart,
  ChefHat,
  Users,
  Receipt,
  Warehouse,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import apiInventory from "@/lib/apiInventory";
import apiVentas from "@/lib/apiVentas";
import { useEmpresa } from "@/context/EmpresaContext";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { empresaId, loading: empresaLoading } = useEmpresa();

  // Alertas de Stock Bajo (Inventario)
  const { data: stockBajo, isLoading: loadingStockBajo } = useQuery({
    queryKey: ["dashboard", "stock-bajo", empresaId],
    queryFn: () =>
      apiInventory.get(`/api/inventory/companies/${empresaId}/dashboard`).then((r) => r.data),
    enabled: !!empresaId,
  });

  // Resumen Diario (Ventas)
  const { data: resumenDiario, isLoading: loadingResumen } = useQuery({
    queryKey: ["dashboard", "resumen-diario", empresaId],
    queryFn: () =>
      apiVentas.get(`/api/sales/companies/${empresaId}/dashboard/daily-sales`).then((r) => r.data),
    enabled: !!empresaId,
  });

  // Carga de KDS (Ventas)
  const { data: cargaKds, isLoading: loadingKds } = useQuery({
    queryKey: ["dashboard", "carga-kds", empresaId],
    queryFn: () =>
      apiVentas.get(`/api/sales/companies/${empresaId}/dashboard/kds-status`).then((r) => r.data),
    enabled: !!empresaId,
  });

  // Top Productos (Ventas)
  const { data: topProductos, isLoading: loadingTop } = useQuery({
    queryKey: ["dashboard", "top-productos", empresaId],
    queryFn: () =>
      apiVentas.get(`/api/sales/companies/${empresaId}/dashboard/top-products`).then((r) => r.data),
    enabled: !!empresaId,
  });

  if (empresaLoading) return <div className="p-8">Cargando empresa...</div>;
  if (!empresaId) return <div className="p-8">Selecciona una empresa en el encabezado.</div>;

  const stats = [
    {
      title: "Ventas del Día",
      value: formatCurrency(resumenDiario?.totalSales || resumenDiario?.totalVentas || 0),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "+12.5%",
      trendColor: "text-emerald-600",
    },
    {
      title: "Tickets Activos",
      value: resumenDiario?.ticketsCount || resumenDiario?.cantidadTickets || 0,
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "En curso",
      trendColor: "text-blue-600",
    },
    {
      title: "Stock Agotado",
      value: stockBajo?.outOfStockCount || 0,
      icon: PackageX,
      color: "text-red-600",
      bg: "bg-red-50",
      trend: "Crítico",
      trendColor: "text-red-600",
    },
    {
      title: "Carga Cocina",
      value: cargaKds?.length || 0,
      icon: ChefHat,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "Media",
      trendColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">Bienvenido al resumen operativo de tu negocio.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/pdv" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Nuevo Ticket
            </Link>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium ${stat.trendColor}`}>{stat.trend}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alertas de Inventario */}
        <div className="bg-card rounded-xl border shadow-sm flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Alertas de Stock
                </div>
                <Link href="/stock" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Ver todo <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="p-0 flex-1">
                {loadingStockBajo ? (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">Consultando inventario...</div>
                ) : stockBajo?.outOfStockCount > 0 ? (
                    <div className="p-6 text-center text-sm text-red-500 font-medium">
                        ¡Atención! Tienes {stockBajo.outOfStockCount} productos agotados.
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">No hay alertas críticas de stock.</div>
                )}
            </div>
        </div>

        {/* Top Productos */}
        <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Top Productos del Día
                </div>
            </div>
            <div className="p-0">
                {loadingTop ? (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">Cargando...</div>
                ) : topProductos?.length > 0 ? (
                    <div className="divide-y">
                        {topProductos.map((p, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-muted-foreground">#{i+1}</span>
                                    <div>
                                        <p className="text-sm font-medium">{p.productName || p.ProductName || `Producto ${p.productCen || p.ProductCen || p.idProducto}`}</p>
                                        <p className="text-xs text-muted-foreground">{p.totalQuantity || p.cantidad || 0} unidades vendidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500" 
                                            style={{ width: `${((p.totalQuantity || p.cantidad || 0) / (topProductos[0].totalQuantity || topProductos[0].cantidad || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">Sin ventas registradas hoy.</div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
}
