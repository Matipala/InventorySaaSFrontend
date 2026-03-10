
import { useEffect, useState } from "react";

export default function ThemeToggleButton() {
    const [theme, setTheme] = useState(undefined);

    useEffect(() => {
        // Solo en cliente: sincronizar con localStorage o preferencia del sistema
        const setInitialTheme = () => {
            const localTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
            if (localTheme === "dark" || (!localTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
                setTheme("dark");
            } else {
                document.documentElement.classList.remove("dark");
                setTheme("light");
            }
        };
        setInitialTheme();
    }, []);

    useEffect(() => {
        if (!theme) return;
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Evitar render hasta que el tema esté definido en cliente
    if (!theme) return null;

    return (
        <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            className="focus:outline-none transition-colors"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            style={{ background: 'none', border: 'none', padding: 0, margin: 0, lineHeight: 0, cursor: 'pointer' }}
        >
            {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-(--foreground)">
                    <path
                        d="M21 12.79A9 9 0 0 1 12.21 3a7 7 0 1 0 8.79 9.79z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-yellow-500">
                    <circle
                        cx="12"
                        cy="12"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
}
