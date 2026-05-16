"use client";

import { Receipt, ShoppingCart, ChefHat, Users } from "lucide-react";
import Link from "next/link";

const links = [
    { href: "/pdv", label: "PDV", icon: ShoppingCart, description: "Abrir cuentas, agregar productos y cobrar." },
    { href: "/kds", label: "KDS", icon: ChefHat, description: "Monitorear comandas y estado de preparación." },
    { href: "/clientes", label: "Clientes", icon: Users, description: "Administrar clientes y datos básicos." },
];

export default function VentasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--foreground)">Módulo Ventas</h1>
                <p className="text-sm text-(--foreground)/70 mt-1">Centro operativo para PDV, KDS y clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {links.map(({ href, label, icon: Icon, description }) => (
                    <Link
                        key={href}
                        href={href}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-(--background) hover:bg-[#ece3f8] dark:hover:bg-[#2b173e] transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                <Icon size={18} />
                            </div>
                            <h2 className="font-semibold text-(--foreground)">{label}</h2>
                        </div>
                        <p className="text-sm text-(--foreground)/70">{description}</p>
                    </Link>
                ))}
            </div>

        </div>
    );
}
