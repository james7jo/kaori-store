import { Suspense } from "react";
import { TiendaClient } from "./TiendaClient";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

// ─── METADATOS DINÁMICOS POR PRODUCTO ───
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

  return {};
}

// ─── PÁGINA PRINCIPAL ───
export default async function Page() {
  const { data: productosIniciales } = await supabase
    .from("productos")
    .select(
      "id, nombre, precio, imagen, galeria, descuento, stock, vendidos, categoria, subcategoria, created_at, consultas",
    )
    .order("id", { ascending: false });

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
        <TiendaClient productosIniciales={productosIniciales ?? []} />
      </Suspense>
    </main>
  );
}
