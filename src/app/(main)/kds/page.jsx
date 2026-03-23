"use client";

import { ChefHat } from "lucide-react";

export default function KdsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-(--foreground)">KDS</h1>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-(--background)">
                <div className="flex items-center gap-3 mb-2">
                    <ChefHat size={18} />
                    <p className="font-semibold text-(--foreground)">Kitchen Display System</p>
                </div>
                <p className="text-sm text-(--foreground)/70">
                    Aquí irá el tablero de comandas con estados: pendiente, preparando y listo.
                </p>
            </div>
        </div>
    );
}
