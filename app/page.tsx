"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarjetaProducto from "./components/TarjetaProducto";
import ModalDetalle from "./components/ModalDetalle";

// ─── PALETA "SUNSET ENERGY" (CLARA Y PROFESIONAL) ─── // NO QUITAR
// Fondo Base: #FFF8F1 (Crema/Naranja ultra claro, suave a la vista)
// Contenedores Secundarios: #FFFFFF (Blanco puro para tarjetas y elementos flotantes)
// Texto Principal: #1F2937 (Gris Pizarra muy oscuro para máxima legibilidad)
// Acento Principal: #F97316 (Naranja consolidado, transmite energía y acción)
// Acento Secundario/Hover: #EA580C (Naranja más oscuro para interacciones)

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

  // ─── CATEGORÍAS BIEN BOLIVIANAS Y ORDENADAS ─── // NO QUITAR
  const categoriasConfig = [
    { id: "Todo", icon: "✨", label: "Todo el Stock" },
    { id: "Tecno", icon: "🎧", label: "Tecnología y Accesorios" },
    { id: "Electro", icon: "🏠", label: "Electrodomésticos" },
    { id: "Insumos", icon: "🩺", label: "Insumos Médicos" },
    { id: "PDF", icon: "📑", label: "Libros y PDFs" },
    { id: "Digital", icon: "🎮", label: "Juegos y Licencias" },
    { id: "Outlet", icon: "💎", label: "Ofertas Outlet" },
  ];

  // ─── CARGA DE PRODUCTOS DESDE SUPABASE ─── // NO QUITAR
  useEffect(() => {
    async function cargarProductos() {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .order("id", { ascending: false });

        if (error) throw error;

        setProductos(data || []);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarProductos();
  }, []);

  // ─── LÓGICA DE FILTRADO ─── // NO QUITAR
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

  // ─── MANEJO DEL MODAL DE DETALLE Y HISTORIAL ─── // NO QUITAR
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

  // ─── PANTALLA DE CARGA ─── // NO QUITAR
  if (loading)
    return (
      // FONDO DE CARGA CLARO: Sunset Cream
      <div className="min-h-screen bg-[#FFF8F1] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Efecto de resplandor de fondo */}
        <div className="absolute w-[300px] h-[300px] bg-[#F97316]/10 blur-[100px] rounded-full animate-pulse" />

        <div className="relative flex flex-col items-center">
          {/* Loader con diseño de diamante moderno */}
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-[#F97316]/20 rounded-2xl rotate-45" />
            <div className="absolute inset-0 border-t-4 border-[#F97316] rounded-2xl rotate-45 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-bounce">⚡</span>
            </div>
          </div>

          {/* Nombre con estilo bloqueado (no traducible) */}
          <h1
            translate="no"
            className="text-4xl font-black italic tracking-tighter uppercase leading-none text-[#1F2937]"
          >
            KAORI
            <span className="text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]">
              STORE
            </span>
          </h1>

          {/* Barra de progreso minimalista */}
          <div className="w-32 h-1 bg-gray-200 mt-6 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        </div>

        <style jsx>{`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );

  return (
    // ─── EL FONDO ES SUNSET CREAM (#FFF8F1) - CLARO Y ENÉRGICO ─── // NO QUITAR
    <div className="min-h-screen bg-[#FFF8F1] text-[#1F2937] font-sans pb-40 overflow-x-hidden">
      {/* ─── SIDEBAR PREMIUM (ESTILO CLARO) ─── */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              // FONDO SIDEBAR: Blanco puro para resaltar
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[70] border-r border-[#F97316]/10 p-6 shadow-2xl flex flex-col rounded-r-3xl"
            >
              <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-5">
                <div>
                  <p className="text-[#F97316] font-black italic text-2xl uppercase tracking-tighter">
                    KAORI STORE
                  </p>
                  <p className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-1">
                    Calidad Garantizada
                  </p>
                </div>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="w-10 h-10 bg-gray-100 rounded-2xl text-gray-500 flex items-center justify-center active:scale-90 transition-transform"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 no-scrollbar pt-2">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">
                  EXPLORAR CATEGORÍAS
                </p>
                {categoriasConfig.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaSel(cat.id);
                      setSoloOfertas(false);
                      setMenuAbierto(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                      categoriaSel === cat.id && !soloOfertas
                        ? "bg-[#F97316] border-transparent text-white font-black shadow-lg shadow-orange-500/20 scale-[1.02]"
                        : "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:border-[#F97316]/30"
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider">
                      {cat.label}
                    </span>
                  </button>
                ))}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-2">
                    TU BOLSA DE COMPRA
                  </p>
                  <button className="w-full flex justify-between items-center p-4 rounded-[1.5rem] bg-[#F97316]/10 border border-[#F97316]/20 group">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛒</span>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-[#1F2937] uppercase leading-none">
                          Mi Carrito
                        </p>
                        <p className="text-[8px] text-[#F97316] font-bold mt-1 uppercase tracking-widest">
                          {carrito.length} Artículos
                        </p>
                      </div>
                    </div>
                    <span className="text-[#F97316] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3 mt-4 border-t border-gray-100">
                <a
                  href="https://wa.me/59174244882"
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 active:scale-95 transition-all"
                >
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">
                      Soporte y Ventas
                    </p>
                    <p className="text-[11px] text-[#1F2937] font-black italic uppercase">
                      WhatsApp Oficial
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-[#22c55e]/10 rounded-full flex items-center justify-center text-[#22c55e]">
                    💬
                  </div>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HEADER (SOLIDEZ Y ENERGÍA) ─── */}
      <div className="p-4 flex justify-between items-center bg-white/95 backdrop-blur-xl sticky top-0 z-40 border-b border-[#F97316]/10 shadow-sm">
        <div className="flex flex-col">
          <Link href="/admin" className="group flex items-center gap-2">
            {/* Mini Emblema K: Para que no sea solo texto aburrido */}
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)] group-hover:rotate-6 transition-transform">
              <span className="text-white text-xl font-black italic">K</span>
            </div>

            <div className="flex flex-col">
              <h1
                translate="no"
                className="text-2xl font-[1000] italic tracking-[-0.05em] uppercase leading-none"
              >
                <span className="text-[#1F2937]">KAORI</span>
                <span className="text-[#F97316] ml-1 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                  STORE
                </span>
              </h1>
            </div>
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[#1F2937] shadow-sm active:scale-90 transition-transform"
          >
            ☰
          </button>
          <button className="relative p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[#1F2937] shadow-sm active:scale-90 transition-transform">
            <span className="text-xl">🛒</span>
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border-2 border-white">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── BUSCADOR FLOTANTE ELEGANTE ─── */}
      <AnimatePresence>
        {buscadorVisible && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-start pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuscadorVisible(false)}
              className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-md pointer-events-auto"
            />
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="w-full max-w-md relative pointer-events-auto"
            >
              <div className="bg-white rounded-[2rem] flex items-center px-6 py-5 border border-[#F97316]/20 shadow-[0_25px_60px_rgba(249,115,22,0.1)]">
                <span className="text-[#F97316] mr-4 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="¿Qué producto buscas?"
                  value={busqueda}
                  autoFocus
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent outline-none text-base w-full text-[#1F2937] font-medium placeholder-gray-400"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="ml-2 text-gray-400 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHIPS (CON DISEÑO SERIO) ─── */}
      <div className="flex gap-3 overflow-x-auto px-4 py-8 no-scrollbar scroll-smooth">
        {categoriasConfig.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaSel(cat.id);
              setSoloOfertas(false);
            }}
            className={`px-7 py-3.5 rounded-full text-[10px] font-black uppercase transition-all flex-shrink-0 border shadow-sm ${
              categoriaSel === cat.id && !soloOfertas
                ? "bg-[#F97316] border-transparent text-white scale-105 shadow-orange-500/20"
                : "bg-white border-gray-100 text-gray-600 hover:border-[#F97316]/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── LISTADO (ALTO CONTRASTE) ─── */}
      <div className="px-5 flex justify-between items-end mb-8">
        <div>
          <p className="text-[9px] font-black text-[#F97316] uppercase tracking-[0.4em] mb-1.5 drop-shadow-[0_0_5px_rgba(249,115,22,0.1)]">
            CATÁLOGO OFICIAL
          </p>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#1F2937] leading-none">
            {soloOfertas
              ? "Super Ofertas"
              : categoriaSel === "Todo"
                ? "Novedades"
                : categoriasConfig.find((c) => c.id === categoriaSel)?.label}
          </h2>
        </div>
        <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
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

      {/* ─── NAVBAR INFERIOR (MODERNO E IOS STYLE) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 px-2 py-5 flex items-end justify-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => {
            setCategoriaSel("Todo");
            setSoloOfertas(false);
            setBusqueda("");
            setBuscadorVisible(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${categoriaSel === "Todo" && !soloOfertas && !buscadorVisible ? "text-[#F97316] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Inicio
          </span>
        </button>

        <button
          onClick={() => {
            setSoloOfertas(true);
            setCategoriaSel("Todo");
            setBuscadorVisible(false);
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${soloOfertas ? "text-[#EF4444] scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl relative flex items-center justify-center">
            🔥{" "}
            {productos.some((p) => p.descuento) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
            )}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Ofertas
          </span>
        </button>

        <button
          onClick={() => setMenuAbierto(true)}
          className="w-1/5 flex flex-col items-center justify-center relative active:scale-95 transition-transform"
        >
          <div className="bg-[#F97316] p-4.5 rounded-3xl -mt-14 shadow-[0_15px_30px_rgba(249,115,22,0.3)] border-4 border-white text-white flex items-center justify-center">
            <span className="text-3xl drop-shadow-md">⚡</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.1em] mt-3.5 text-[#F97316]">
            Explorar
          </span>
        </button>

        <button
          onClick={() => setBuscadorVisible(!buscadorVisible)}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${buscadorVisible ? "text-[#F97316] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Buscar
          </span>
        </button>

        <button className="w-1/5 flex flex-col items-center justify-center gap-1.5 text-gray-400 active:scale-95 transition-transform">
          <span className="text-2xl relative flex items-center justify-center">
            🛒{" "}
            {carrito.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border-2 border-white">
                {carrito.length}
              </span>
            )}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
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
