"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarjetaProducto from "./components/TarjetaProducto";
import ModalDetalle from "./components/ModalDetalle";

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
  // Su función es cerrar el cuadro de detalles del producto o buscador en lugar de cerrar toda la página web. // NO QUITAR
  useEffect(() => {
    const manejarBotonAtras = () => {
      if (sel) setSel(null);
      if (buscadorVisible) setBuscadorVisible(false);
    };
    window.addEventListener("popstate", manejarBotonAtras);
    return () => window.removeEventListener("popstate", manejarBotonAtras);
  }, [sel, buscadorVisible]);

  // ─── CATEGORÍAS BIEN BOLIVIANAS Y ORDENADAS ───
  const categoriasConfig = [
    { id: "Todo", icon: "✨", label: "Todo" },
    { id: "Tecno", icon: "🎧", label: "Tecnologia y Accesorios" },
    { id: "Electro", icon: "🏠", label: "Electrodomésticos" },
    { id: "Insumos", icon: "🩺", label: "Insumos Médicos" },
    { id: "PDF", icon: "📑", label: "Libros y PDFs" },
    { id: "Digital", icon: "🎮", label: "Juegos y Licencias" },
    { id: "Outlet", icon: "💎", label: "Ofertas Outlet" },
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

  // Sirve para que el celular crea que "entraste" a otra página y habilite el botón de volver. // NO QUITAR
  const abrirProducto = (p: any) => {
    setSel(p);
    window.history.pushState({ modalOpen: true }, "");
  };

  // Evita que el historial del navegador se llene de basura si cierras el modal manualmente. // NO QUITAR
  const cerrarProducto = () => {
    setSel(null);
    if (window.history.state?.modalOpen) window.history.back();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#00050a] flex items-center justify-center">
        <p className="text-blue-500 font-black animate-pulse italic tracking-[0.3em] uppercase text-xl">
          KAORI STORE
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#00050a] text-white font-sans pb-40 overflow-x-hidden">
      {/* ─── SIDEBAR AZUL PREMIUM ─── */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuAbierto(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#000a12] z-[70] border-r border-blue-900/30 p-6 shadow-[20px_0_50px_rgba(0,100,255,0.1)] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-blue-500 font-black italic text-xl uppercase tracking-tighter">
                    KAORI STORE
                  </p>
                  <p className="text-[7px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1 opacity-50">
                    Blue Experience
                  </p>
                </div>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="w-10 h-10 bg-blue-950/20 rounded-2xl text-blue-400 flex items-center justify-center border border-blue-500/20"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 no-scrollbar">
                <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.3em] mb-3 ml-2">
                  Categorías
                </p>
                {categoriasConfig.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaSel(cat.id);
                      setSoloOfertas(false);
                      setMenuAbierto(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all border ${
                      categoriaSel === cat.id && !soloOfertas
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 border-transparent text-white font-black shadow-[0_0_20px_rgba(0,100,255,0.3)] scale-[1.02]"
                        : "bg-white/5 text-gray-400 border-white/5 hover:border-blue-500/20"
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[10px] uppercase font-black italic tracking-wider">
                      {cat.label}
                    </span>
                  </button>
                ))}

                <div className="mt-6 pt-6 border-t border-blue-900/20">
                  <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.3em] mb-3 ml-2">
                    Tu Bolsa
                  </p>
                  <button className="w-full flex justify-between items-center p-4 rounded-[1.5rem] bg-blue-600/10 border border-blue-600/20 group">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛒</span>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white uppercase italic leading-none">
                          Mi Carrito
                        </p>
                        <p className="text-[8px] text-blue-400 font-bold mt-1 uppercase tracking-widest">
                          {carrito.length} Artículos
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3 mt-4 border-t border-blue-900/20">
                <a
                  href="https://wa.me/59174244882"
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border border-white/10 active:scale-95 transition-all"
                >
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">
                      Escríbenos
                    </p>
                    <p className="text-[11px] text-white font-black italic uppercase">
                      WhatsApp Directo
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                    💬
                  </div>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HEADER (AZUL ELÉCTRICO) ─── */}
      <div className="p-4 flex justify-between items-center bg-[#00050a] sticky top-0 z-40 border-b border-blue-900/10">
        <div className="flex flex-col">
          <Link href="/admin">
            <h1
              translate="no"
              className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent uppercase leading-none drop-shadow-[0_0_10px_rgba(0,150,255,0.4)]"
            >
              KAORI STORE
            </h1>
          </Link>
          <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mt-1">
            Premium Experience
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-3 bg-blue-950/10 rounded-2xl border border-blue-500/20 text-blue-400 shadow-xl"
          >
            ☰
          </button>
          <button className="relative p-3 bg-blue-950/10 rounded-2xl border border-blue-500/20">
            <span className="text-xl">🛒</span>
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border-2 border-[#00050a]">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── BUSCADOR FLOTANTE (ESTILO BLUE) ─── */}
      <AnimatePresence>
        {buscadorVisible && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-start pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuscadorVisible(false)}
              className="absolute inset-0 bg-[#00050a]/80 backdrop-blur-md pointer-events-auto"
            />
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="w-full max-w-md relative pointer-events-auto"
            >
              <div className="bg-[#000a12] rounded-[2rem] flex items-center px-6 py-5 border border-blue-600/30 shadow-[0_0_40px_rgba(0,100,255,0.2)]">
                <span className="text-blue-400 mr-4 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="¿Qué buscas en Kaori?"
                  value={busqueda}
                  autoFocus
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent outline-none text-base w-full text-white font-medium placeholder-blue-900"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="ml-2 text-blue-200 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHIPS (CYAN/BLUE NEÓN) ─── */}
      <div className="flex gap-3 overflow-x-auto px-4 py-6 no-scrollbar scroll-smooth">
        {categoriasConfig.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaSel(cat.id);
              setSoloOfertas(false);
            }}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black italic uppercase transition-all flex-shrink-0 border shadow-md ${
              categoriaSel === cat.id && !soloOfertas
                ? "bg-blue-600 border-transparent text-white shadow-[0_0_15px_rgba(0,100,255,0.4)] scale-105"
                : "bg-[#000a12] border-white/5 text-gray-500 hover:text-blue-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── LISTADO (TÍTULOS BLANCO HIELO) ─── */}
      <div className="px-5 flex justify-between items-end mb-8">
        <div>
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
            {soloOfertas ? "Exclusivo" : "Catálogo"}
          </p>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
            {soloOfertas
              ? "Super Ofertas"
              : categoriaSel === "Todo"
                ? "Novedades"
                : categoriasConfig.find((c) => c.id === categoriaSel)?.label}
          </h2>
        </div>
        <div className="bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-600/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
          {productosFiltrados.length} Items
        </div>
      </div>

      {/* PRODUCTOS */}
      <div className="px-4 grid grid-cols-2 gap-5">
        {productosFiltrados.map((p) => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onClick={() => abrirProducto(p)}
          />
        ))}
      </div>

      {/* ─── NAVBAR INFERIOR (AZUL PROFUNDO) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#00050a]/95 backdrop-blur-2xl border-t border-blue-900/20 px-2 py-4 flex items-end justify-center z-50 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,30,80,0.3)]">
        <button
          onClick={() => {
            setCategoriaSel("Todo");
            setSoloOfertas(false);
            setBusqueda("");
            setBuscadorVisible(false);
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1 transition-all ${categoriaSel === "Todo" && !soloOfertas && !buscadorVisible ? "text-blue-400 scale-110" : "text-gray-600"}`}
        >
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(0,100,255,0.4)]">
            🏠
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.1em]">
            Inicio
          </span>
        </button>

        <button
          onClick={() => {
            setSoloOfertas(true);
            setCategoriaSel("Todo");
            setBuscadorVisible(false);
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1 transition-all ${soloOfertas ? "text-cyan-400 scale-110" : "text-gray-600"}`}
        >
          <span className="text-2xl relative flex items-center justify-center">
            🔥{" "}
            {productos.some((p) => p.descuento) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            )}
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.1em]">
            Ofertas
          </span>
        </button>

        <button
          onClick={() => setMenuAbierto(true)}
          className="w-1/5 flex flex-col items-center justify-center relative"
        >
          <div className="bg-gradient-to-tr from-blue-500 to-blue-800 p-3.5 rounded-2xl -mt-10 shadow-[0_10px_25px_rgba(0,100,255,0.4)] border-4 border-[#00050a] text-white flex items-center justify-center active:scale-90 transition-transform">
            <span className="text-2xl">⚡</span>
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.1em] mt-2 text-blue-400">
            Explorar
          </span>
        </button>

        <button
          onClick={() => setBuscadorVisible(!buscadorVisible)}
          className={`w-1/5 flex flex-col items-center justify-center gap-1 transition-all ${buscadorVisible ? "text-blue-400 scale-110" : "text-gray-600"}`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-[7px] font-black uppercase tracking-[0.1em]">
            Buscar
          </span>
        </button>

        <button className="w-1/5 flex flex-col items-center justify-center gap-1 text-gray-600">
          <span className="text-2xl relative flex items-center justify-center">
            🛒{" "}
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {carrito.length}
              </span>
            )}
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.1em]">
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
