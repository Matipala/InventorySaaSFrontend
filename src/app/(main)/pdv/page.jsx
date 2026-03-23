"use client";

import { ShoppingCart } from "lucide-react";

export default function PdvPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-(--foreground)">PDV</h1>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-(--background)">
                <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart size={18} />
                    <p className="font-semibold text-(--foreground)">Punto de venta</p>
                </div>
                <p className="text-sm text-(--foreground)/70">
                    Aquí irá el flujo de apertura de cuenta, agregación de items y pago.
                </p>
            </div>
        </div>
    );
}
