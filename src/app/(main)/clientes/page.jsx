"use client";

import { Users } from "lucide-react";

export default function ClientesPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-(--foreground)">Clientes</h1>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-(--background)">
                <div className="flex items-center gap-3 mb-2">
                    <Users size={18} />
                    <p className="font-semibold text-(--foreground)">Gestión de clientes</p>
                </div>
                <p className="text-sm text-(--foreground)/70">
                    Aquí podrás registrar y consultar clientes para asociarlos a cuentas de venta.
                </p>
            </div>
        </div>
    );
}
