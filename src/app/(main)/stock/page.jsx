import { BarChart3 } from "lucide-react";

export const metadata = { title: "Stock — Inventory SaaS" };

export default function StockPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Stock</h1>
        <p className="text-sm text-(--foreground)/70 mt-1">Niveles de inventario por almacén y producto</p>
      </div>
      <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-3 text-(--foreground)/60">
        <BarChart3 size={40} className="opacity-40" />
        <p className="text-sm">Módulo de stock — próximamente</p>
      </div>
    </div>
  );
}
