"use client";

import { Users } from "lucide-react";

export default function ClientesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--foreground)">Clientes</h1>
                <p className="text-sm text-(--foreground)/70 mt-1">Administración de clientes</p>
            </div>

            <div className="bg-(--background) rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 gap-3 text-[var(--foreground)/0.6]">
                <Users size={48} className="opacity-40" />
                <p className="font-semibold text-lg">Módulo en construcción</p>
                <p className="text-sm text-center max-w-sm">
                    Próximamente podrás administrar tus clientes desde aquí.
                </p>
            </div>
        </div>
    );
}
