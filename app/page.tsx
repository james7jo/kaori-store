import { Suspense } from "react";
import { TiendaClient } from "./TiendaClient"; // Asegúrate que el nombre coincida

export default function Page() {
  return (
    <main>
      {/* ESTO ES LO QUE VERCEL PIDE: 
          Envolver el componente en Suspense para que useSearchParams no falle en el build 
      */}
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
            <div className="text-[#F97316] font-black animate-pulse">
              CARGANDO KAORI STORE...
            </div>
          </div>
        }
      >
        <TiendaClient />
      </Suspense>
    </main>
  );
}
