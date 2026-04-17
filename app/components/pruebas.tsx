"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- TIPOS E INTERFACES (Esto sí puede ir fuera) ---
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  galeria: string;
  descuento?: string;
  vendidos?: number;
  stock?: number;
  consultas?: number;
  categoria?: string;
  estado?: string;
}

type FormState = {
  nombre: string;
  precio: string;
  descripcion: string;
  imagen: string;
  galeria: string;
  descuento: string;
  stock: string;
  categoria: string;
  estado: string;
};

const FORM_VACIO: FormState = {
  nombre: "",
  precio: "",
  descripcion: "",
  imagen: "",
  galeria: "",
  descuento: "",
  stock: "",
  categoria: "Todo",
  estado: "nuevo",
};

const OPCIONES_CATEGORIA = [
  { id: "Todo", label: "General / Novedades" },
  { id: "Tecno", label: "Celulares y Audífonos" },
  { id: "Electro", label: "Electrodomésticos" },
  { id: "Insumos", label: "Insumos Médicos" },
  { id: "PDF", label: "Libros y PDFs" },
  { id: "Digital", label: "Juegos y Licencias" },
  { id: "Outlet", label: "Ofertas Outlet" },
  { id: "PetShop", label: "Pet Shop / Mascotas" },
];

const ITEMS_POR_PAGINA = 10;

// --- COMPONENTES AUXILIARES (Fuera del principal para no causar re-renders) ---
function StatCard({ label, value, sub, accent = false, icon }: any) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-1.5 border relative overflow-hidden ${accent ? "bg-gradient-to-br from-orange-600 to-red-700 border-transparent" : "bg-[#141414] border-white/5"}`}
    >
      {icon && (
        <span className="absolute right-4 top-4 text-2xl opacity-20">
          {icon}
        </span>
      )}
      <span
        className={`text-[10px] font-black uppercase tracking-[0.25em] ${accent ? "text-orange-200" : "text-gray-600"}`}
      >
        {label}
      </span>
      <span className="text-3xl font-black italic text-white">{value}</span>
      {sub && (
        <span
          className={`text-[10px] font-bold ${accent ? "text-orange-200/70" : "text-gray-700"}`}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function AdminDashboardKaori() {
  // 1. TODOS LOS ESTADOS VAN AQUÍ ADENTRO
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginaActual, setPaginaActual] = useState(0);
  const [subiendoGaleria, setSubiendoGaleria] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todo");
  const [seccion, setSeccion] = useState<"inventario" | "agregar">(
    "inventario",
  );
  const [statsTotales, setStatsTotales] = useState({
    dinero: 0,
    consultas: 0,
    descuentos: 0,
  });

  // 2. TODA LA LÓGICA DE FUNCIONES VA AQUÍ ADENTRO
  const handleSubirGaleria = async (archivos: File[]) => {
    setSubiendoGaleria(true);
    const urlsSubidas: string[] = [];
    try {
      for (const archivo of archivos) {
        const fileExt = archivo.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `galeria-productos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("productos")
          .upload(filePath, archivo);
        if (uploadError) continue;

        const {
          data: { publicUrl },
        } = supabase.storage.from("productos").getPublicUrl(filePath);
        urlsSubidas.push(publicUrl);
      }
      // Actualizamos el campo galeria del formulario sumando las nuevas fotos
      const galeriaActual = form.galeria ? form.galeria.split(",") : [];
      setForm({
        ...form,
        galeria: [...galeriaActual, ...urlsSubidas].filter(Boolean).join(","),
      });
      alert(`✅ ${urlsSubidas.length} imágenes añadidas a la galería`);
    } catch (error) {
      alert("Error subiendo galería");
    } finally {
      setSubiendoGaleria(false);
    }
  };

  useEffect(() => {
    cargarInventario();
    cargarMetricasGlobales();
  }, [paginaActual, filtroCategoria]);

  async function cargarMetricasGlobales() {
    const { data, error } = await supabase
      .from("productos")
      .select("precio, descuento, consultas");
    if (!error && data) {
      const dinero = data.reduce((acc, p) => acc + Number(p.precio), 0);
      const consultas = data.reduce((acc, p) => acc + (p.consultas ?? 0), 0);
      const descuentos = data.filter((p) => p.descuento).length;
      setStatsTotales({ dinero, consultas, descuentos });
    }
  }

  async function cargarInventario() {
    const desde = paginaActual * ITEMS_POR_PAGINA;
    const hasta = desde + ITEMS_POR_PAGINA - 1;
    let consulta = supabase.from("productos").select("*", { count: "exact" });
    if (filtroCategoria !== "Todo")
      consulta = consulta.eq("categoria", filtroCategoria);

    const { data, count, error } = await consulta
      .order("id", { ascending: false })
      .range(desde, hasta);
    if (!error) {
      setProductos(data || []);
      setTotalItems(count || 0);
    }
  }

  const prepararEdicion = (p: Producto) => {
    setIdEditando(p.id);
    setForm({
      nombre: p.nombre,
      precio: String(p.precio),
      descripcion: p.descripcion,
      imagen: p.imagen,
      galeria: p.galeria ?? "",
      descuento: p.descuento ?? "",
      stock: String(p.stock ?? 0),
      categoria: p.categoria || "Todo",
      estado: p.estado || "nuevo",
    });
    setSeccion("agregar");
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setForm(FORM_VACIO);
    setSeccion("inventario");
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    try {
      // (Mantenemos tu lógica de envío que ya tenías)
      const datos = {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion,
        imagen: form.imagen,
        galeria: form.galeria,
        descuento: form.descuento || null,
        stock: parseInt(form.stock) || 0,
        categoria: form.categoria,
        estado: form.estado,
      };

      if (idEditando) {
        await supabase.from("productos").update(datos).eq("id", idEditando);
      } else {
        await supabase
          .from("productos")
          .insert([{ ...datos, vendidos: 0, consultas: 0 }]);
      }
      cancelarEdicion();
      cargarInventario();
    } catch (err) {
      alert("Error al guardar");
    } finally {
      setSubiendo(false);
    }
  };

  const filtradosLocal = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // 3. EL RENDERIZADO
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* ... (Aquí va todo tu JSX que ya tenías, está bien diseñado) ... */}
      {/* Solo asegúrate de usar handleSubirGaleria dentro del input de galeria */}
      {/* Reutiliza el resto de tu código de UI aquí */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-b border-white/5 p-4">
        {/* ... (Header logic) ... */}
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-black text-orange-500 italic">KAORI ADMIN</span>
          <div className="flex gap-4">
            <button
              onClick={cancelarEdicion}
              className="text-xs uppercase font-bold"
            >
              Inventario
            </button>
            <button
              onClick={() => setSeccion("agregar")}
              className="text-xs uppercase font-bold"
            >
              + Agregar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-5">
        {seccion === "inventario" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtradosLocal.map((p) => (
              <div
                key={p.id}
                className="bg-[#111] p-4 rounded-2xl border border-white/5"
              >
                <img
                  src={p.imagen}
                  className="w-full aspect-square object-cover rounded-xl mb-2"
                />
                <p className="text-xs font-bold truncate">{p.nombre}</p>
                <button
                  onClick={() => prepararEdicion(p)}
                  className="text-[10px] text-orange-500 mt-2"
                >
                  EDITAR
                </button>
              </div>
            ))}
          </div>
        ) : (
          <form
            onSubmit={manejarEnvio}
            className="max-w-2xl mx-auto space-y-6 bg-[#111] p-8 rounded-[2rem]"
          >
            <Campo label="Nombre del Producto">
              <input
                className="w-full bg-white/5 p-3 rounded-xl"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Campo>

            <Campo label="Galería Múltiple">
              <input
                type="file"
                multiple
                onChange={(e) =>
                  e.target.files &&
                  handleSubirGaleria(Array.from(e.target.files))
                }
                className="w-full text-xs text-gray-500 file:bg-orange-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg"
              />
              {subiendoGaleria && (
                <p className="text-orange-500 animate-pulse text-[10px]">
                  Subiendo a la nube...
                </p>
              )}
            </Campo>

            <button
              type="submit"
              className="w-full py-4 bg-orange-600 rounded-2xl font-black"
            >
              GUARDAR PRODUCTO
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
