"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

interface Props {
  producto: any;
  onClose: () => void;
  onAgregar: (p: any) => void;
}

export default function ModalDetalle({ producto, onClose, onAgregar }: Props) {
  const [indexFoto, setIndexFoto] = useState(0);
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);

  const fotos = producto.galeria
    ? [producto.imagen, ...producto.galeria.split(",").filter(Boolean)]
    : [producto.imagen];

  const galleryRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // 📍 LÓGICA DE UBICACIÓN GPS PROFESIONAL
  const obtenerUbicacion = () => {
    setLoadingGps(true);
    if (!navigator.geolocation) {
      alert("GPS no disponible en este dispositivo");
      setLoadingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUbicacion(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setLoadingGps(false);
      },
      () => {
        alert("Por favor, activa el GPS para coordinar tu entrega.");
        setLoadingGps(false);
      },
    );
  };

  const enviarWhatsApp = (accion: "compra" | "consulta") => {
    const gpsPart = ubicacion
      ? `\n📍 *Punto de entrega:* ${ubicacion}`
      : "\n📍 *Ubicación:* No compartida";
    const baseText =
      accion === "compra"
        ? `¡Hola Kaori Store! 👋 Quiero cerrar el pedido de:`
        : `¡Hola! Tengo una consulta sobre este producto:`;

    const text = `${baseText}\n\n⭐ *${producto.nombre}*\n🔢 *Cantidad:* ${cantidad}\n💰 *Precio:* BOB ${producto.precio}${gpsPart}`;
    window.open(`https://wa.me/59174244882?text=${encodeURIComponent(text)}`);
  };

  return (
    <>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden font-sans"
      >
        {/* HEADER COMPACTO RETAIL */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button
            onClick={onClose}
            className="p-2 text-[#1F2937] text-2xl font-black active:scale-90"
          >
            ✕
          </button>
          <div className="flex flex-col items-center">
            <h1
              translate="no"
              className="text-base font-black italic tracking-tighter uppercase text-[#1F2937]"
            >
              KAORI <span className="text-[#F97316]">STORE</span>
            </h1>
            <div className="h-[2px] w-8 bg-[#F97316] rounded-full" />
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto pb-40">
          {/* GALERÍA CON SWIPE (FOTOS GRANDES) */}
          <div
            className="relative w-full bg-white overflow-hidden"
            style={{ height: "42vh" }}
            ref={galleryRef}
          >
            <motion.div
              className="w-full h-full flex items-center p-4 cursor-pointer"
              style={{ x: dragX }}
              drag="x"
              dragConstraints={galleryRef}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50 && indexFoto > 0)
                  setIndexFoto(indexFoto - 1);
                else if (info.offset.x < -50 && indexFoto < fotos.length - 1)
                  setIndexFoto(indexFoto + 1);
                dragX.set(0);
              }}
              onClick={() => setShowImageModal(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={indexFoto}
                  src={fotos[indexFoto]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain select-none pointer-events-none"
                  alt="Producto Kaori"
                />
              </AnimatePresence>
            </motion.div>

            {/* DOTS DE NAVEGACIÓN */}
            {fotos.length > 1 && (
              <div className="absolute bottom-4 flex gap-1.5 left-1/2 -translate-x-1/2 bg-gray-900/5 px-3 py-2 rounded-full backdrop-blur-sm">
                {fotos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === indexFoto ? "w-6 bg-[#F97316]" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* CUERPO DE DATOS (ESTILO CAPTURA + RELLENO) */}
          <div className="px-6 py-6 flex flex-col gap-6">
            {/* 1. PRECIO Y NOMBRE (IDÉNTICO A TU CAPTURA) */}
            <div className="space-y-1">
              <h2 className="text-[30px] font-black text-[#1F2937] italic leading-none tracking-tighter">
                BOB {producto.precio}
              </h2>
              <h3 className="text-[22px] font-black text-[#1F2937] uppercase italic tracking-tighter leading-tight">
                {producto.nombre}
              </h3>
            </div>

            {/* 2. RELLENO DE CONFIANZA (PARA QUE NO SE VEA VACÍO) */}
            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-xl">🛡️</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-[#1F2937]">
                    Garantía
                  </span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase">
                    Oficial Kaori
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-xl">✅</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-[#1F2937]">
                    Entrega
                  </span>
                  <span className="text-[8px] text-emerald-600 font-bold uppercase">
                    100% Segura
                  </span>
                </div>
              </div>
            </div>

            {/* 3. DESCRIPCIÓN (BLOQUE CARD) */}
            <div className="bg-[#f8f9fb] p-5 rounded-[2.2rem] border border-gray-50">
              <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.15em] mb-3">
                Descripción del Producto
              </p>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed italic">
                "
                {producto.descripcion ||
                  "Producto de alta calidad. Consulte detalles técnicos y colores disponibles vía WhatsApp."}
                "
              </p>
            </div>

            {/* 4. SELECTOR DE CANTIDAD */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase text-gray-400">
                Seleccionar Cantidad
              </span>
              <div className="flex items-center gap-5 bg-gray-50 rounded-2xl p-1 border border-gray-100">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-9 h-9 flex items-center justify-center font-black text-[#F97316] active:scale-90"
                >
                  -
                </button>
                <span className="text-base font-black text-[#1F2937] w-4 text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() =>
                    setCantidad(Math.min(producto.stock || 99, cantidad + 1))
                  }
                  className="w-9 h-9 flex items-center justify-center font-black text-[#F97316] active:scale-90"
                >
                  +
                </button>
              </div>
            </div>

            {/* 5. LOGÍSTICA Y GPS (DISEÑO SOBRIO) */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[2.2rem] shadow-sm">
                <span className="text-2xl">🚛</span>
                <div>
                  <p className="text-[11px] font-black text-[#1F2937] uppercase italic leading-none">
                    Logística de Envío Nacional
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                    Despachos asegurados a toda Bolivia
                  </p>
                </div>
              </div>

              <div className="px-1">
                <button
                  onClick={obtenerUbicacion}
                  className={`w-full py-4 rounded-[1.8rem] border-2 font-black uppercase text-[10px] tracking-widest transition-all ${ubicacion ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "bg-white border-gray-100 text-[#1F2937] active:bg-gray-50"}`}
                >
                  {loadingGps
                    ? "Localizando punto..."
                    : ubicacion
                      ? "✓ Punto de Entrega Vinculado"
                      : "Confirmar Punto de Entrega (GPS)"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACCIONES (BOTONES PROPORCIONALES) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30 flex gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <button
            onClick={() => onAgregar(producto)}
            className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-xl active:scale-95 transition-all shadow-sm"
          >
            🛒
          </button>

          <button
            onClick={() => enviarWhatsApp("consulta")}
            className="flex-1 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#1F2937] active:scale-95 transition-all"
          >
            Consultar
          </button>

          <button
            onClick={() => enviarWhatsApp("compra")}
            className="flex-[2.5] bg-[#F97316] text-white rounded-2xl py-4 flex flex-col items-center justify-center shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
          >
            <span className="text-[13px] font-black uppercase italic tracking-widest">
              Cerrar Pedido
            </span>
            <span className="text-[8px] font-bold opacity-80 uppercase tracking-tighter">
              Vía WhatsApp Directo
            </span>
          </button>
        </div>
      </motion.div>

      {/* ZOOM MODAL FULLSCREEN */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={fotos[indexFoto]}
              className="w-full h-full object-contain"
              style={{ touchAction: "pinch-zoom" }}
              alt="Zoom"
            />
            <button className="absolute top-8 right-8 text-white text-3xl font-black">
              ✕
            </button>
            <p className="absolute bottom-10 text-white/50 text-[10px] uppercase font-bold tracking-[0.3em]">
              Toque para volver
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
