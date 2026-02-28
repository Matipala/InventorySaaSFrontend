import { Warehouse } from "lucide-react";

export const metadata = { title: "Almacenes — Inventory SaaS" };

export default function AlmacenesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Almacenes</h1>
        <p className="text-sm text-(--foreground)/70 mt-1">Gestión de almacenes y ubicaciones</p>
      </div>
      <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-3 text-(--foreground)/60">
        <Warehouse size={40} className="opacity-40" />
        <p className="text-sm">Módulo de almacenes — próximamente</p>
      </div>
    </div>
  );
}
