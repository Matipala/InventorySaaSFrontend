"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    Tag,
    BarChart3,
    ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/productos", label: "Productos", icon: Package },
    { href: "/almacenes", label: "Almacenes", icon: Warehouse },
    { href: "/categorias", label: "Categorías", icon: Tag },
    { href: "/stock", label: "Stock", icon: BarChart3 },
    { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
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
                {navItems.map(({ href, label, icon: Icon }) => (
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
