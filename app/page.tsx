"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarjetaProducto from "./components/TarjetaProducto";
import ModalDetalle from "./components/ModalDetalle";

// ─── PALETA DE COLOR REAL (SOLIDO) // NO QUITAR ───
// Fondo Base: #2563EB (Azul Eléctrico Real, con mucha vida)
// Contenedores Secundarios: #1D4ED8 (Un azul más profundo para dar volumen)
// Texto: #FFFFFF (Blanco puro para que brille sobre el azul)
// Acento de Botones: #FACC15 (Amarillo vibrante del logo para resaltar)

export default function CatalogoKaori() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todo");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [carrito, setCarrito] = useState<any[]>([]);

  // ─── LÓGICA DE CONTROL DE HISTORIAL (BOTÓN ATRÁS) ───
  useEffect(() => {
    const manejarBotonAtras = () => {
      if (sel) setSel(null);
      if (buscadorVisible) setBuscadorVisible(false);
    };
    window.addEventListener("popstate", manejarBotonAtras);
    return () => window.removeEventListener("popstate", manejarBotonAtras);
  }, [sel, buscadorVisible]);

  // ─── CATEGORÍAS ───
  const categoriasConfig = [
    { id: "Todo", icon: "✨", label: "Todo" },
    { id: "Tecno", icon: "🎧", label: "Tecnología" },
    { id: "Electro", icon: "🏠", label: "Hogar" },
    { id: "Insumos", icon: "🩺", label: "Médica" },
    { id: "PDF", icon: "📑", label: "Libros" },
    { id: "Digital", icon: "🎮", label: "Juegos" },
    { id: "Outlet", icon: "💎", label: "Ofertas" },
  ];

  useEffect(() => {
    async function cargarProductos() {
      const { data } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: false });
      setProductos(data || []);
      setLoading(false);
    }
    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideOferta = !soloOfertas || (p.descuento && p.descuento !== "");
    const coincideCat =
      categoriaSel === "Todo" ||
      p.descripcion?.toLowerCase().includes(categoriaSel.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(categoriaSel.toLowerCase()) ||
      p.nombre?.toLowerCase().includes(categoriaSel.toLowerCase());
    return coincideBusqueda && coincideCat && coincideOferta;
  });

  const abrirProducto = (p: any) => {
    setSel(p);
    window.history.pushState({ modalOpen: true }, "");
  };

  const cerrarProducto = () => {
    setSel(null);
    if (window.history.state?.modalOpen) window.history.back();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#2563EB] flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-white border-t-yellow-400 rounded-full animate-spin"></div>
      </div>
    );

  return (
    // ─── EL FONDO ES AZUL REAL (#2563EB) ───
    <div className="min-h-screen bg-[#2563EB] text-white font-sans pb-40 overflow-x-hidden">
      {/* ─── SIDEBAR (AZUL OSCURO) ─── */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuAbierto(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#1E40AF] z-[70] p-6 shadow-2xl flex flex-col border-r border-white/10"
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/20 pb-5">
                <p className="text-white font-black text-2xl tracking-tighter uppercase italic">
                  MENU KAORI
                </p>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="w-10 h-10 bg-white/10 rounded-2xl text-white flex items-center justify-center border border-white/20"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto flex-1 no-scrollbar">
                {categoriasConfig.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaSel(cat.id);
                      setSoloOfertas(false);
                      setMenuAbierto(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      categoriaSel === cat.id && !soloOfertas
                        ? "bg-yellow-400 text-blue-900 font-black shadow-lg scale-[1.02]"
                        : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs uppercase font-black tracking-widest">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HEADER ─── */}
      <div className="p-4 flex justify-between items-center bg-[#1E40AF] sticky top-0 z-40 border-b border-white/20 shadow-lg">
        <div className="flex flex-col">
          <Link href="/admin">
            <h1
              translate="no"
              className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            >
              KAORI<span className="text-yellow-400">STORE</span>
            </h1>
          </Link>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">
            ¡Novedades Increíbles!
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-3 bg-white/10 rounded-2xl border border-white/20 text-white active:scale-90 transition-all shadow-md"
          >
            ☰
          </button>
          <button className="relative p-3 bg-white/10 rounded-2xl border border-white/20 text-white shadow-md">
            <span className="text-xl">🛒</span>
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-blue-800">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── BUSCADOR FLOTANTE // COLOR SOLIDO ─── */}
      <AnimatePresence>
        {buscadorVisible && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-start pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuscadorVisible(false)}
              className="absolute inset-0 bg-[#1E40AF]/90 backdrop-blur-md pointer-events-auto"
            />
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="w-full max-w-md relative pointer-events-auto"
            >
              <div className="bg-white rounded-[2.5rem] flex items-center px-7 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-yellow-400">
                <span className="text-blue-600 mr-4 text-2xl">🔍</span>
                <input
                  type="text"
                  placeholder="Busca productos..."
                  value={busqueda}
                  autoFocus
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent outline-none text-base w-full text-blue-900 font-black placeholder-blue-300"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="ml-2 text-blue-400 text-2xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHIPS (AMARILLO Y AZUL) ─── */}
      <div className="flex gap-3 overflow-x-auto px-4 py-8 no-scrollbar scroll-smooth">
        {categoriasConfig.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaSel(cat.id);
              setSoloOfertas(false);
            }}
            className={`px-7 py-4 rounded-[2rem] text-[10px] font-black uppercase transition-all flex-shrink-0 shadow-lg ${
              categoriaSel === cat.id && !soloOfertas
                ? "bg-yellow-400 text-blue-900 border-transparent scale-105"
                : "bg-[#1E40AF] border border-white/20 text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── LISTADO (TÍTULOS POTENTES) ─── */}
      <div className="px-5 flex justify-between items-end mb-10">
        <div className="drop-shadow-lg">
          <p className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.4em] mb-1.5">
            MUNDO KAORI
          </p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            {soloOfertas
              ? "Super Ofertas"
              : categoriaSel === "Todo"
                ? "Novedades"
                : categoriasConfig.find((c) => c.id === categoriaSel)?.label}
          </h2>
        </div>
        <div className="bg-yellow-400 px-5 py-2.5 rounded-full text-[11px] font-black text-blue-900 uppercase shadow-md border-b-4 border-yellow-600">
          {productosFiltrados.length} Items
        </div>
      </div>

      {/* GRID PRODUCTOS */}
      <div className="px-4 grid grid-cols-2 gap-6">
        {productosFiltrados.map((p) => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onClick={() => abrirProducto(p)}
          />
        ))}
      </div>

      {/* ─── NAVBAR INFERIOR (COLOR SÓLIDO AZUL) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1E40AF] border-t-4 border-yellow-400 px-2 py-5 flex items-end justify-center z-50 rounded-t-[3rem] shadow-[0_-15px_30px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => {
            setCategoriaSel("Todo");
            setSoloOfertas(false);
            setBusqueda("");
            setBuscadorVisible(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${categoriaSel === "Todo" && !soloOfertas && !buscadorVisible ? "text-yellow-400 scale-110" : "text-white/60"}`}
        >
          <span className="text-2xl drop-shadow-md">🏠</span>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            Inicio
          </span>
        </button>

        <button
          onClick={() => {
            setSoloOfertas(true);
            setCategoriaSel("Todo");
            setBuscadorVisible(false);
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${soloOfertas ? "text-yellow-400 scale-110" : "text-white/60"}`}
        >
          <span className="text-2xl relative flex items-center justify-center">
            🔥{" "}
            {productos.some((p) => p.descuento) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-blue-900"></span>
            )}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            Ofertas
          </span>
        </button>

        <button
          onClick={() => setMenuAbierto(true)}
          className="w-1/5 flex flex-col items-center justify-center relative"
        >
          <div className="bg-yellow-400 p-4.5 rounded-3xl -mt-14 shadow-2xl border-4 border-[#2563EB] text-blue-900 flex items-center justify-center active:scale-90 transition-transform">
            <span className="text-3xl">⚡</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em] mt-3 text-white">
            Explorar
          </span>
        </button>

        <button
          onClick={() => setBuscadorVisible(!buscadorVisible)}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${buscadorVisible ? "text-yellow-400 scale-110" : "text-white/60"}`}
        >
          <span className="text-2xl drop-shadow-md">🔍</span>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            Buscar
          </span>
        </button>

        <button className="w-1/5 flex flex-col items-center justify-center gap-1.5 text-white/60">
          <span className="text-2xl relative flex items-center justify-center drop-shadow-md">
            🛒{" "}
            {carrito.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-blue-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-blue-900">
                {carrito.length}
              </span>
            )}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
            Carrito
          </span>
        </button>
      </div>

      <AnimatePresence>
        {sel && (
          <ModalDetalle
            producto={sel}
            onClose={cerrarProducto}
            onAgregar={(p) => setCarrito([...carrito, p])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
