"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
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
}

type FormState = {
  nombre: string;
  precio: string;
  descripcion: string;
  imagen: string;
  galeria: string;
  descuento: string;
  stock: string;
};

const FORM_VACIO: FormState = {
  nombre: "",
  precio: "",
  descripcion: "",
  imagen: "",
  galeria: "",
  descuento: "",
  stock: "",
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent = false,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-1.5 border relative overflow-hidden ${
        accent
          ? "bg-gradient-to-br from-orange-600 to-red-700 border-transparent"
          : "bg-[#141414] border-white/5"
      }`}
    >
      {icon && (
        <span className="absolute right-4 top-4 text-2xl opacity-20 select-none">{icon}</span>
      )}
      <span
        className={`text-[10px] font-black uppercase tracking-[0.25em] ${
          accent ? "text-orange-200" : "text-gray-600"
        }`}
      >
        {label}
      </span>
      <span className="text-3xl font-black italic leading-none text-white">{value}</span>
      {sub && (
        <span className={`text-[10px] font-bold truncate ${accent ? "text-orange-200/70" : "text-gray-700"}`}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA INVENTARIO
// ─────────────────────────────────────────────
function TarjetaInventario({
  producto: p,
  onEditar,
  onEliminar,
}: {
  producto: Producto;
  onEditar: (p: Producto) => void;
  onEliminar: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="group bg-[#141414] border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-[#0d0d0d] overflow-hidden flex-shrink-0">
        <img
          src={p.imagen}
          alt={p.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
          <span className="text-[8px] font-black tracking-widest text-gray-400 uppercase">
            #{p.id.toString().padStart(4, "0")}
          </span>
        </div>
        {p.descuento && (
          <div className="absolute top-2.5 right-2.5 bg-red-600 px-2 py-0.5 rounded-md">
            <span className="text-[9px] font-black text-white">-{p.descuento}</span>
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <span className="text-[9px]">💬</span>
          <span className="text-[9px] font-black text-orange-400">
            {p.consultas ?? 0}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-sm font-black italic text-white leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-orange-400 transition-colors">
            {p.nombre}
          </p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-orange-500 text-[11px] font-bold">Bs</span>
            <span className="text-orange-400 text-xl font-black italic">{p.precio}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEditar(p)}
            className="flex-1 py-2.5 bg-white/6 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-orange-600 hover:text-white hover:border-transparent active:scale-[0.95] transition-all flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button
            onClick={() => onEliminar(p.id)}
            className="px-4 py-2.5 bg-red-900/20 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white hover:border-transparent active:scale-[0.95] transition-all flex items-center justify-center"
            title="Eliminar producto"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// CAMPO DE FORMULARIO
// ─────────────────────────────────────────────
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3.5 bg-white/5 border border-white/8 rounded-xl outline-none focus:border-orange-500/70 focus:bg-white/8 transition-all text-white placeholder-gray-600 text-sm font-medium";

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
export default function AdminDashboardKaori() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [subiendo, setSubiendo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tabVista, setTabVista] = useState<"grid" | "lista">("grid");
  const [seccion, setSeccion] = useState<"inventario" | "agregar">("inventario");

  useEffect(() => {
    cargarInventario();
  }, []);

  async function cargarInventario() {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false });
    setProductos(data || []);
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
      stock: p.stock !== undefined ? String(p.stock) : "",
    });
    setSeccion("agregar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setForm(FORM_VACIO);
    setSeccion("inventario");
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    await supabase.from("productos").delete().eq("id", id);
    cargarInventario();
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);

    const fPrincipal = (document.getElementById("foto") as HTMLInputElement)?.files?.[0];
    const fGaleria = (document.getElementById("galeria") as HTMLInputElement)?.files;

    try {
      let urlPrincipal = form.imagen;
      let urlsGaleria = form.galeria ? form.galeria.split(",") : [];

      if (fPrincipal) {
        const nom = `${Date.now()}_main.png`;
        const { error: uploadError } = await supabase.storage.from("productos").upload(nom, fPrincipal);
        if (uploadError) throw uploadError;
        urlPrincipal = supabase.storage.from("productos").getPublicUrl(nom).data.publicUrl;
      }

      if (fGaleria && fGaleria.length > 0) {
        const nuevasUrls: string[] = [];
        for (let i = 0; i < fGaleria.length; i++) {
          const nomG = `${Date.now()}_gal_${i}.png`;
          await supabase.storage.from("productos").upload(nomG, fGaleria[i]);
          nuevasUrls.push(supabase.storage.from("productos").getPublicUrl(nomG).data.publicUrl);
        }
        urlsGaleria = [...urlsGaleria, ...nuevasUrls];
      }

      // CORRECCIÓN: Los datos ahora coinciden exactamente con lo que creaste en Supabase
      const datos: any = {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion,
        imagen: urlPrincipal,
        galeria: urlsGaleria.join(","),
        descuento: form.descuento || null,
        stock: form.stock ? parseInt(form.stock) : 0, // Si no hay stock, guardamos 0
      };

      if (idEditando) {
        const { error: updateError } = await supabase
          .from("productos")
          .update(datos)
          .eq("id", idEditando);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("productos")
          .insert([{ ...datos, consultas: 0 }]); // Consultas nace en 0
        if (insertError) throw insertError;
      }

      setIdEditando(null);
      setForm(FORM_VACIO);
      setSeccion("inventario");
      cargarInventario();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const filtrados = productos.filter(
    (p) => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalConsultas = productos.reduce((s, p) => s + (p.consultas ?? 0), 0);
  const totalInventario = productos.reduce((s, p) => s + Number(p.precio), 0);
  const masConsultado = [...productos].sort((a, b) => (b.consultas ?? 0) - (a.consultas ?? 0))[0];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs">K</span>
            </div>
            <div>
              <span className="font-black italic tracking-tighter bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent text-lg uppercase">Kaori</span>
              <span className="text-[10px] text-gray-600 font-bold tracking-widest ml-1.5 uppercase hidden sm:inline">Admin</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {(["inventario", "agregar"] as const).map((tab) => (
              <button key={tab} onClick={() => tab === "inventario" ? cancelarEdicion() : setSeccion("agregar")}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${seccion === tab ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-400"}`}>
                {tab === "inventario" ? "Inventario" : idEditando ? "✏️ Editando" : "+ Agregar"}
              </button>
            ))}
          </nav>
          <Link href="/" className="px-4 py-2 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Vista Live</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8 space-y-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Productos" value={productos.length} accent icon="📦" />
          <StatCard label="Valor total" value={`Bs ${totalInventario.toFixed(0)}`} icon="💰" />
          <StatCard label="Con descuento" value={productos.filter((p) => p.descuento).length} icon="🏷️" />
          <StatCard label="Consultas" value={totalConsultas} sub={masConsultado && (masConsultado.consultas ?? 0) > 0 ? `Top: ${masConsultado.nombre.slice(0, 15)}...` : ""} icon="💬" />
        </div>

        <AnimatePresence mode="wait">
          {seccion === "inventario" && (
            <motion.div key="inventario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Inventario activo — {filtrados.length} productos</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:w-56 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
                    <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm outline-none focus:border-orange-500/50 transition-all text-gray-300" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtrados.map((p) => <TarjetaInventario key={p.id} producto={p} onEditar={prepararEdicion} onEliminar={eliminarProducto} />)}
              </div>
            </motion.div>
          )}

          {seccion === "agregar" && (
            <motion.div key="formulario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="relative bg-[#111] border border-white/8 rounded-[2rem] overflow-hidden shadow-2xl">
                <form onSubmit={manejarEnvio} className="relative z-10 p-8 space-y-8">
                  <h3 className="text-2xl font-black italic uppercase text-white">{idEditando ? "Editar producto" : "Nuevo producto"}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <Campo label="Nombre"><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} required /></Campo>
                      <div className="grid grid-cols-2 gap-4">
                        <Campo label="Precio (Bs)"><input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className={inputCls} required /></Campo>
                        <Campo label="Descuento"><input type="text" value={form.descuento} onChange={(e) => setForm({ ...form, descuento: e.target.value })} className={inputCls} /></Campo>
                      </div>
                      <Campo label="Descripción"><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={`${inputCls} h-36 resize-none`} required /></Campo>
                    </div>
                    <div className="space-y-5">
                      <Campo label="Stock (Unidades)"><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} /></Campo>
                      <Campo label="Foto principal">
                        <input type="file" id="foto" accept="image/*" className="w-full text-xs text-gray-500 file:bg-orange-600 file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white" />
                      </Campo>
                      <Campo label="Galería adicional">
                        <input type="file" id="galeria" accept="image/*" multiple className="w-full text-xs text-gray-500 file:bg-gray-700 file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white" />
                      </Campo>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-white/5">
                    <button type="submit" disabled={subiendo} className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl font-black italic text-lg uppercase shadow-xl active:scale-95 transition-all">
                      {subiendo ? "Procesando..." : idEditando ? "Guardar" : "Publicar"}
                    </button>
                    <button type="button" onClick={cancelarEdicion} className="px-8 py-4 bg-white/5 border border-white/8 rounded-2xl font-black text-gray-500 uppercase text-sm">Cancelar</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}