import { Suspense } from "react";
import { TiendaClient } from "./TiendaClient";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

// ✅ ESTO SE AGREGA — conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ✅ ESTO SE AGREGA — metadatos dinámicos por producto
export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const productoId = searchParams.p;

  if (productoId && typeof productoId === "string") {
    const { data: producto } = await supabase
      .from("productos")
      .select("nombre, imagen, precio")
      .eq("id", productoId)
      .single();

    if (producto) {
      return {
        title: `${producto.nombre} | Kaori Store`,
        description: `¡Llévate este ${producto.nombre} por solo ${producto.precio} Bs! Envíos a toda Bolivia.`,
        openGraph: {
          title: producto.nombre,
          description: `Oferta exclusiva: ${producto.nombre}`,
          url: `https://kaoristore.shop/?p=${productoId}`,
          images: [{ url: producto.imagen, width: 800, height: 800 }],
        },
      };
    }
  }

  return {}; // Si no hay ?p=, usa los metadatos del layout.tsx
}

// ✅ ESTO YA TENÍAS — no lo toques
export default function Page() {
  return (
    <main>
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
