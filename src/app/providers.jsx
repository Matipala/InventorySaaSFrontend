"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmpresaProvider } from "@/context/EmpresaContext";

export default function Providers({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60, // 1 minuto
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <EmpresaProvider>{children}</EmpresaProvider>
        </QueryClientProvider>
    );
}
