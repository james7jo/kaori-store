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
  const [sel, setSel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [soloOfertas, setSoloOfertas] = useState(false);

  useEffect(() => {
    async function cargarProductos() {
      const { data } = await supabase.from('productos').select('*').order('id', { ascending: false });
      setProductos(data || []);
      setLoading(false);
    }
    cargarProductos();
  }, []);

  // FILTRADO MAESTRO: Por búsqueda y por pestaña de Ofertas
  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    if (soloOfertas) {
      return coincideBusqueda && (p.descuento !== null && p.descuento !== "");
    }
    return coincideBusqueda;
  });

  const agregarAlCarrito = (p: any) => {
    setCarrito([...carrito, p]);
    setSel(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black animate-pulse italic text-xl tracking-[0.3em] uppercase">Kaori Store</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] pb-32 font-sans text-white overflow-x-hidden">
      
      {/* HEADER PREMIUM DARK */}
      <div className="sticky top-0 bg-[#080808]/80 backdrop-blur-xl z-30 border-b border-white/5 shadow-2xl">
        <div className="p-4 flex justify-between items-center">
          <Link href="/admin">
            <div className="flex flex-col">
              <h1 
  translate="no" 
  className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent uppercase"
>
  KAORI STORE
</h1>
              <span className="text-[8px] font-bold tracking-[0.4em] text-gray-500 -mt-1 uppercase">Ventas Seguras</span>
            </div>
          </Link>
          <button className="relative p-3 bg-white/5 rounded-2xl active:scale-90 transition-all border border-white/10">
            <span className="text-xl">🛒</span>
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#080808]">
                {carrito.length}
              </span>
            )}
          </button>
        </div>

        {/* BUSCADOR ESTILO INDUSTRIAL */}
        <div className="px-4 pb-4">
          <div className="relative flex items-center bg-white/5 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-orange-500/50 transition-all shadow-inner">
            <span className="text-gray-500 mr-2 text-lg">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-gray-200 font-medium placeholder-gray-600" 
            />
            {busqueda && (
              <button onClick={() => setBusqueda("")} className="text-gray-400 bg-white/10 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DINÁMICA */}
      <div className="p-5">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {soloOfertas ? '🔥 Super Ofertas' : busqueda ? 'Resultados' : 'Explorar'}
            </h2>
            <div className="h-1 w-12 bg-orange-600 rounded-full mt-1"></div>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {productosFiltrados.length} Items
          </span>
        </div>

        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {productosFiltrados.map((p) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={p.id}
              >
                <TarjetaProducto producto={p} onClick={() => setSel(p)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="text-6xl mb-4 opacity-20 text-orange-600">📦</div>
            <p className="text-gray-500 font-black uppercase tracking-widest">No hay artículos disponibles</p>
            {soloOfertas && (
              <button 
                onClick={() => setSoloOfertas(false)}
                className="mt-4 text-orange-500 text-xs font-bold underline"
              >
                Ver todo el catálogo
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL Y DETALLE */}
      <AnimatePresence>
        {sel && (
          <ModalDetalle 
            producto={sel} 
            onClose={() => setSel(null)} 
            onAgregar={agregarAlCarrito} 
          />
        )}
      </AnimatePresence>

      {/* WHATSAPP FLOTANTE CON GLOW */}
      <a 
        href="https://wa.me/59174244882" 
        target="_blank"
        className="fixed bottom-28 right-6 bg-[#25D366] w-14 h-14 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.4)] flex items-center justify-center text-white text-2xl z-40 border-4 border-[#080808] active:scale-90 transition-all"
      >
        <span className="animate-pulse">💬</span>
      </a>

      {/* NAVBAR INFERIOR FUTURISTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#080808]/90 backdrop-blur-2xl border-t border-white/10 p-4 flex justify-around items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-[2.5rem]">
        
        <button 
          onClick={() => { setSoloOfertas(false); setBusqueda(""); }}
          className={`flex flex-col items-center transition-all ${!soloOfertas ? 'text-orange-500 scale-110' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Inicio</span>
        </button>

        <button 
          onClick={() => setSoloOfertas(true)}
          className={`flex flex-col items-center transition-all ${soloOfertas ? 'text-red-500 scale-110' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <span className="text-2xl relative">
            🔥
            {productos.some(p => p.descuento) && !soloOfertas && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            )}
          </span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Ofertas</span>
        </button>

        <Link href="/admin" className="flex flex-col items-center text-gray-600 hover:text-gray-400 transition-all">
          <span className="text-2xl">👤</span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Admin</span>
        </Link>
        
      </div>
    </div>
  );
}