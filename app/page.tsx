"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CatalogoKaori() {
  const [productos, setProductos] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS REALES DE SUPABASE
  useEffect(() => {
    async function cargarProductos() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: false });

      if (error) console.log("Error cargando productos:", error);
      else setProductos(data || []);
      setLoading(false);
    }
    cargarProductos();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
      <p className="text-gray-400 font-black animate-pulse italic">KAORI STORE...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-24 font-sans text-gray-900">
      
      {/* HEADER BUSCADOR CON LINK SECRETO AL ADMIN EN EL TEXTO */}
      <div className="sticky top-0 bg-white p-4 z-30 shadow-sm">
        <div className="flex justify-between items-center mb-3">
            <Link href="/admin">
                <h1 className="text-xl font-black italic tracking-tighter cursor-default select-none">
                    KAORI STORE
                </h1>
            </Link>
        </div>
        <div className="relative flex items-center bg-[#f0f0f0] rounded-full px-4 py-2 border border-gray-200">
          <span className="text-gray-400 mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar en Kaori Store..." 
            className="bg-transparent outline-none text-sm w-full text-gray-700" 
          />
        </div>
      </div>

      {/* SECCIÓN OFERTAS */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900 tracking-tight italic">SuperOfertas</h2>
        <span className="text-red-600 text-sm font-bold">Ver más &gt;</span>
      </div>

      {/* GRID DE PRODUCTOS DINÁMICO */}
      <div className="grid grid-cols-2 gap-[6px] px-[6px]">
        {productos.map((p) => (
          <motion.div 
            key={p.id} 
            onClick={() => setSel(p)} 
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="aspect-square bg-gray-50 relative">
              <img src={p.imagen} className="w-full h-full object-cover" alt={p.nombre} />
              {p.descuento && (
                 <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    -{p.descuento}
                 </span>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-baseline gap-1 text-red-600">
                <span className="text-[12px] font-bold uppercase">Bs</span>
                <span className="text-xl font-black">{p.precio}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {p.precio_original && (
                    <span className="text-[10px] text-gray-400 line-through">Bs {p.precio_original}</span>
                )}
                <span className="bg-red-50 text-red-600 text-[10px] px-1 font-bold rounded">Oferta</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                {p.vendidos || "0"} vendidos
              </p>
              <p className="text-[13px] text-gray-700 leading-tight mt-1 line-clamp-2 h-8 font-medium">
                {p.nombre}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BARRA NAVEGACIÓN INFERIOR (ESTILO APP) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex justify-around items-center z-40">
        <div className="flex flex-col items-center text-red-500 font-bold">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">Inicio</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-xl">🔥</span>
          <span className="text-[10px]">Ofertas</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-xl">💬</span>
          <span className="text-[10px]">Chat</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px]">Cuenta</span>
        </div>
      </div>

      {/* MODAL DE DETALLE (ALIEXPRESS LOOK) */}
      <AnimatePresence>
        {sel && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
          >
            {/* Cabecera Flotante */}
            <div className="p-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <button onClick={() => setSel(null)} className="bg-black/5 p-2 rounded-full text-xl">✕</button>
              <div className="flex gap-3">
                <span className="bg-black/5 p-2 rounded-full">🔗</span>
                <span className="bg-black/5 p-2 rounded-full">🛒</span>
              </div>
            </div>

            <img src={sel.img} className="w-full aspect-square object-cover" alt={sel.nombre} />

            <div className="p-5">
              <div className="flex items-baseline gap-1 text-red-600">
                <span className="text-xl font-bold">Bs</span>
                <span className="text-4xl font-black">{sel.precio}</span>
              </div>
              
              <h2 className="text-xl font-bold mt-4 leading-tight text-gray-800">{sel.nombre}</h2>

              {/* Características estilo AliExpress */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-t border-b py-3 text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-bold text-gray-800">Envío Gratis a Villazón</span>
                  <span className="text-gray-400">❯</span>
                </div>
                <div className="flex items-center justify-between border-b py-3 text-sm">
                  <span className="text-gray-500">Servicio</span>
                  <span className="font-bold text-gray-800">Protección al comprador de 6 meses</span>
                  <span className="text-gray-400">❯</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Descripción del Producto</h3>
                <p className="text-gray-600 leading-relaxed text-md">{sel.descripcion}</p>
              </div>

              <div className="h-28"></div> 
            </div>

            {/* BOTÓN DE COMPRA POR WHATSAPP */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-50">
              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-xl">💬</span>
                <span className="text-[10px] text-gray-500 font-bold">Chat</span>
              </div>
              <button 
                onClick={() => {
                  const num = "591XXXXXXXX"; // <--- TU NÚMERO AQUÍ
                  const text = `¡Hola Kaori Store! 👋 Me interesa comprar el producto: ${sel.nombre} por el precio de Bs ${sel.precio}. ¿Tienen disponibilidad?`;
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);
                }}
                className="flex-1 bg-gradient-to-r from-[#ff5d2e] to-[#ff1c1c] text-white py-4 rounded-full font-black text-lg shadow-lg shadow-red-200 active:scale-95 transition-all uppercase tracking-tighter"
              >
                Comprar Ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}