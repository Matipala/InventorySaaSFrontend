import { AlertCircle } from "lucide-react";

export function AlertError({ error }) {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-4 text-red-600 dark:text-red-400 my-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-1">No se pudo completar la operación</h3>
        <p className="text-sm opacity-90 leading-relaxed">
          {typeof error === "string" ? error : error.message || "Ocurrió un error inesperado."}
        </p>
      </div>
    </div>
  );
}
