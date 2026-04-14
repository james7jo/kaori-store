"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  producto: any;
  onClose: () => void;
  onAgregar: (p: any) => void;
}

export default function ModalDetalle({ producto, onClose, onAgregar }: Props) {
  // Configuración de galería: Imagen principal + las de la columna galeria
  const fotos = producto.galeria ? [producto.imagen, ...producto.galeria.split(',')] : [producto.imagen];
  const [indexFoto, setIndexFoto] = useState(0);

  const consultarWhatsApp = () => {
    const num = "59174244882"; 
    const text = `¡Hola Kaori Store! 👋 Tengo una consulta sobre: ${producto.nombre}.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);
  };

  const comprarAhora = () => {
    const num = "59174244882";
    const text = `¡Hola! Quiero comprar este producto: ${producto.nombre} (Bs ${producto.precio}).`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#080808] z-50 flex flex-col overflow-hidden"
    >
      {/* CABECERA GLASS */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-[#080808]/80 backdrop-blur-xl z-20 border-b border-white/5">
        <button 
          onClick={onClose} 
          className="bg-white/5 p-2 rounded-full text-white w-10 h-10 flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          ✕
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black italic text-[10px] tracking-[0.3em] text-orange-500 uppercase">Kaori Premium</span>
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Detalle de Producto</span>
        </div>
        <button onClick={consultarWhatsApp} className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-2 rounded-xl border border-white/5">Ayuda</button>
      </div>

      <div className="overflow-y-auto flex-1 pb-44">
        {/* CARRUSEL DE IMÁGENES */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center group">
          <AnimatePresence mode="wait">
            <motion.img
              key={indexFoto}
              src={fotos[indexFoto]}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full object-contain p-6"
              alt={producto.nombre}
            />
          </AnimatePresence>

          {/* Indicadores de Galería */}
          {fotos.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {fotos.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === indexFoto ? 'w-8 bg-orange-600' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          )}

          {/* Areas de toque para cambiar foto (izq / der) */}
          {fotos.length > 1 && (
            <div className="absolute inset-0 flex">
              <div className="flex-1" onClick={() => setIndexFoto(indexFoto > 0 ? indexFoto - 1 : fotos.length - 1)}></div>
              <div className="flex-1" onClick={() => setIndexFoto(indexFoto < fotos.length - 1 ? indexFoto + 1 : 0)}></div>
            </div>
          )}

          {producto.descuento && (
            <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-xl font-black italic shadow-[0_0_20px_rgba(220,38,38,0.5)] text-sm">
              -{producto.descuento}
            </div>
          )}
        </div>

        {/* INFO PRINCIPAL */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-orange-500 text-2xl font-bold italic">Bs</span>
                <span className="text-6xl font-black italic tracking-tighter text-white">{producto.precio}</span>
              </div>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                Stock Disponible
              </p>
            </div>
            <button className="bg-white/5 p-4 rounded-3xl border border-white/10 text-xl active:scale-90 transition-all">❤️</button>
          </div>
          
          <h2 className="text-3xl font-black mt-6 leading-tight text-white italic uppercase tracking-tighter">
            {producto.nombre}
          </h2>

          {/* LOGÍSTICA ESTILO DARK */}
          <div className="mt-10 space-y-4">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 text-center">Logística Kaori</h3>
            
            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-2xl">📍</div>
              <div>
                <p className="text-sm font-black text-blue-400 uppercase italic">Cochabamba</p>
                <p className="text-[11px] text-gray-500 font-medium">Entrega gratuita hoy mismo.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center text-2xl">🚛</div>
              <div>
                <p className="text-sm font-black text-orange-400 uppercase italic">Villazón y La Paz</p>
                <p className="text-[11px] text-gray-500 font-medium">Envíos sin costo a terminal.</p>
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mt-10 mb-10">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Ficha Técnica</h3>
            <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5 italic">
              <p className="text-gray-400 leading-relaxed text-md font-medium">
                "{producto.descripcion}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER DE ACCIONES */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#080808]/90 backdrop-blur-2xl border-t border-white/10 p-5 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] rounded-t-[3rem]">
        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => onAgregar(producto)}
            className="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>🛒</span> + Carrito
          </button>
          <button 
            onClick={consultarWhatsApp}
            className="w-20 bg-white/5 border border-white/10 text-white py-5 rounded-3xl font-black text-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            💬
          </button>
        </div>
        
        <button 
          onClick={comprarAhora}
          className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white py-6 rounded-3xl font-black text-xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] active:scale-[0.98] transition-all uppercase italic tracking-tighter"
        >
          ¡Comprar Ahora! ⚡
        </button>
      </div>
    </motion.div>
  );
}