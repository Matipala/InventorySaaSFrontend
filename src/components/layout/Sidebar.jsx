"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    Tags,
    Ruler,
    TrendingUp,
    ArrowLeftRight,
    Receipt,
    ShoppingCart,
    Users,
    Monitor,
    Settings,
    FileText
} from "lucide-react";

const inventoryItems = [
    { href: "/productos", label: "Productos", icon: Package },
    { href: "/almacenes", label: "Almacenes", icon: Warehouse },
    { href: "/categorias", label: "Categorías", icon: Tags },
    { href: "/unidades", label: "Unidades", icon: Ruler },
    { href: "/stock", label: "Stock", icon: TrendingUp },
    { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
];

const salesItems = [
    { href: "/ventas", label: "Ventas", icon: FileText },
    { href: "/pdv", label: "PDV", icon: ShoppingCart },
    { href: "/kds", label: "KDS", icon: Monitor },

    { href: "/configuracion", label: "Configuración", icon: Settings },
];

const purchaseItems = [
    { href: "/compras", label: "Compras", icon: Receipt },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 min-h-screen flex flex-col shrink-0 border-r border-[#bfa5e2] dark:border-[#43206b]" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Brand */}
            <div className="p-6 border-b border-[#bfa5e2] dark:border-[#43206b]">
                <h1 className="text-xl font-bold text-(--foreground)">Inventory SaaS</h1>
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
                    <LayoutDashboard size={18} />
                    Dashboard
                </Link>

                <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wide text-(--foreground)/60">Inventario</p>
                {inventoryItems.map(({ href, label, icon: Icon }) => (
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
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}

                <p className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-(--foreground)/60">Ventas</p>
                {salesItems.map(({ href, label, icon: Icon }) => (
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
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}

                <p className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-(--foreground)/60">Compras</p>
                {purchaseItems.map(({ href, label, icon: Icon }) => (
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
                        <Icon size={18} />
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
