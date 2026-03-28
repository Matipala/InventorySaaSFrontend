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
} from "lucide-react";
import apiInventory from "@/lib/apiInventory";
import { useEmpresa } from "@/context/EmpresaContext";
import { useProductos } from "@/hooks/useProductos";

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue: "bg-(--background) text-(--foreground) border-blue-200 dark:border-blue-700",
    red: "bg-(--background) text-(--foreground) border-red-200 dark:border-red-700",
    yellow: "bg-(--background) text-(--foreground) border-yellow-200 dark:border-yellow-700",
    green: "bg-(--background) text-(--foreground) border-green-200 dark:border-green-700",
  };
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 ${colors[color]}`}>
      <div className="p-2 rounded-lg bg-(--background)/60">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-3xl font-bold mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function AlertList({ title, icon: Icon, items, renderItem, emptyMsg }) {
  return (
    <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <Icon size={18} className="text-(--foreground)/70" />
        <h2 className="text-sm font-semibold text-(--foreground)">{title}</h2>
        <span className="ml-auto text-xs bg-(--background) text-(--foreground)/70 px-2 py-0.5 rounded-full">
          {items?.length ?? 0}
        </span>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800 max-h-64 overflow-y-auto">
        {items?.length === 0 && (
          <li className="px-5 py-4 text-sm text-(--foreground)/60 text-center">{emptyMsg}</li>
        )}
        {items?.map((item, i) => (
          <li key={i} className="px-5 py-3 text-sm text-(--foreground)">
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleCard({ title, subtitle, icon: Icon, links }) {
  return (
    <section className="bg-(--background) rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-(--background)/60 border border-gray-200 dark:border-gray-700">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-(--foreground)">{title}</h2>
          <p className="text-xs text-(--foreground)/70">{subtitle}</p>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-[#ece3f8] dark:hover:bg-[#2b173e] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-(--foreground)">{item.label}</p>
              <p className="text-xs text-(--foreground)/70 mt-0.5">{item.description}</p>
            </div>
            <ChevronRight size={16} className="text-(--foreground)/60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { empresaId } = useEmpresa();
  const { data: productos } = useProductos();

  const { data: stockBajo } = useQuery({
    queryKey: ["alertas-stock-bajo", empresaId],
    queryFn: () => api.get("/api/Stock/alertas/bajo?umbral=10").then((r) => r.data),
    enabled: !!empresaId,
  });

  const { data: stockAgotado } = useQuery({
    queryKey: ["alertas-stock-agotado", empresaId],
    queryFn: () => api.get("/api/Stock/alertas/agotado").then((r) => r.data),
    enabled: !!empresaId,
  });

  if (!empresaId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-(--foreground)/60 mt-20">
        <Warehouse size={48} className="opacity-40" />
        <p className="text-lg font-medium">Selecciona una empresa para continuar</p>
        <p className="text-sm">Usa el selector en la parte superior derecha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Dashboard</h1>
        <p className="text-sm text-(--foreground)/70 mt-1">Resumen del estado del inventario</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Package}
          label="Total de productos"
          value={productos?.length}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock bajo"
          value={stockBajo?.length}
          color="yellow"
        />
        <StatCard
          icon={PackageX}
          label="Productos agotados"
          value={stockAgotado?.length}
          color="red"
        />
      </div>

    </div>
  );
}
