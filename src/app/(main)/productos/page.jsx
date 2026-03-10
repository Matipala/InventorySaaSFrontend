import { Package } from "lucide-react";

export const metadata = { title: "Productos — Inventory SaaS" };

export default function ProductosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">Productos</h1>
          <p className="text-sm text-(--foreground)/70 mt-1">Gestión del catálogo de productos</p>
        </div>
      </div>
      <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-3 text-(--foreground)/60">
        <Package size={40} className="opacity-40" />
        <p className="text-sm">Módulo de productos — próximamente</p>
      </div>
    </div>
  );
}
