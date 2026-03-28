"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const inventoryItems = [
    { href: "/productos", label: "Productos" },
    { href: "/almacenes", label: "Almacenes" },
    { href: "/categorias", label: "Categorías" },
    { href: "/unidades", label: "Unidades" },
    { href: "/stock", label: "Stock" },
    { href: "/movimientos", label: "Movimientos" },
];

const salesItems = [
    { href: "/ventas", label: "Ventas" },
    { href: "/pdv", label: "PDV" },
    { href: "/kds", label: "KDS" },
    { href: "/clientes", label: "Clientes" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 min-h-screen flex flex-col shrink-0 border-r border-[#bfa5e2] dark:border-[#43206b]" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Brand */}
            <div className="p-6 border-b border-[#bfa5e2] dark:border-[#43206b]">
                <h1 className="text-xl font-bold text-(--foreground)">Inventory SaaS</h1>
                <p className="text-xs text-(--foreground) mt-1">Gestión de inventario</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-4",
                        pathname === "/dashboard"
                            ? "bg-[#43206b] text-(--foreground) dark:bg-[#43206b] dark:text-(--foreground)"
                            : "text-(--foreground) hover:bg-[#bfa5e2] hover:text-(--foreground)"
                    )}
                >
                    Dashboard
                </Link>

                <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wide text-(--foreground)/60">Inventario</p>
                {inventoryItems.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === href
                                ? "bg-[#43206b] text-(--foreground) dark:bg-[#43206b] dark:text-(--foreground)"
                                : "text-(--foreground) hover:bg-[#bfa5e2] hover:text-(--foreground)"
                        )}
                    >
                        {label}
                    </Link>
                ))}

                <p className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-(--foreground)/60">Ventas</p>
                {salesItems.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            pathname === href
                                ? "bg-[#43206b] text-(--foreground) dark:bg-[#43206b] dark:text-(--foreground)"
                                : "text-(--foreground) hover:bg-[#bfa5e2] hover:text-(--foreground)"
                        )}
                    >
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#bfa5e2] dark:border-[#43206b]">
                <p className="text-xs text-(--foreground) text-center"></p>
            </div>
        </aside>
    );
}
