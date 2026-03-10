import { Tag } from "lucide-react";

export const metadata = { title: "Categorías — Inventory SaaS" };

export default function CategoriasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Categorías</h1>
        <p className="text-sm text-(--foreground)/70 mt-1">Clasificación de productos</p>
      </div>
      <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-3 text-(--foreground)/60">
        <Tag size={40} className="opacity-40" />
        <p className="text-sm">Módulo de categorías — próximamente</p>
      </div>
    </div>
  );
}
