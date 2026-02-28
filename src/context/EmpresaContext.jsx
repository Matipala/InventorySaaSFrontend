"use client";

import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext(null);

export function EmpresaProvider({ children }) {
    const [empresaId, setEmpresaIdState] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("empresaId");
        if (stored) setEmpresaIdState(Number(stored));
        setLoading(false);
    }, []);

    const setEmpresaId = (id) => {
        if (id) {
            localStorage.setItem("empresaId", String(id));
        } else {
            localStorage.removeItem("empresaId");
        }
        setEmpresaIdState(id ? Number(id) : null);
    };

    return (
        <EmpresaContext.Provider value={{ empresaId, setEmpresaId, loading }}>
            {children}
        </EmpresaContext.Provider>
    );
}

export function useEmpresa() {
    const context = useContext(EmpresaContext);
    if (!context) {
        throw new Error("useEmpresa debe usarse dentro de <EmpresaProvider>");
    }
    return context;
}
