"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

interface Props {
  producto: any;
  onClose: () => void;
  onAgregar: (p: any) => void;
  ubicacion: any;
  regionNombre: string;
  vincularGps: () => void;
  loadingGps: boolean;
  modoManual: boolean;
  setModoManual: (val: boolean) => void;
}
export default function ModalDetalle({
  producto,
  onClose,
  onAgregar,
  ubicacion,
  regionNombre,
  vincularGps,
  loadingGps,
  modoManual,
  setModoManual,
}: Props) {
  // ─── ESTADOS DE CONTROL ───
  const [textoCiudad, setTextoCiudad] = useState("");
  const [ciudadManual, setCiudadManual] = useState("");
  const [indexFoto, setIndexFoto] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detalle");
  const [agregado, setAgregado] = useState(false);

  const fotos = producto.galeria
    ? [producto.imagen, ...producto.galeria.split(",").filter(Boolean)]
    : [producto.imagen];
  // --- 1. LÓGICA DE CARRUSEL AUTOMÁTICO ---
  useEffect(() => {
    // Si solo hay una foto o el usuario está viendo el Zoom, no rotamos
    if (fotos.length <= 1 || showImageModal) return;

    const intervalo = setInterval(() => {
      setIndexFoto((prev) => (prev + 1) % fotos.length);
    }, 3500); // Cambia cada 3.5 segundos

    return () => clearInterval(intervalo);
  }, [fotos.length, showImageModal]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const gpsRef = useRef<HTMLDivElement>(null); // Añade esto donde están los otros useRef

  // ─── BLOQUEO DE SCROLL DEL BODY ───
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const enviarWhatsApp = (accion: "compra" | "consulta") => {
    // ─── LOGICA DE DATOS ───
    const precioFinal = (producto.precio * cantidad).toFixed(2);
    const fecha = new Date().toLocaleDateString("es-BO"); // Fecha local de Bolivia

    // ─── ESTRUCTURA DEL TICKET (Diseño Visual) ───
    const separador = "━━━━━━━━━━━━━━━━━━━━━━";
    const titulo =
      accion === "compra" ? "🚀 *PEDIDO CONFIRMADO*" : " *CONSULTA TÉCNICA*❓";

    // Cuerpo para COMPRA
    const cuerpoCompra = `
*PRODUCTO:*
• ${producto.nombre.toUpperCase()}
• Precio Unit: ${producto.precio} Bs.
• Cantidad: ${cantidad} un.

${separador}
💰 *TOTAL A PAGAR: ${precioFinal} Bs.*
${separador}

*📍 DATOS DE ENTREGA:*
• *Región:* ${regionNombre || "No especificada"}
${ubicacion ? `• *Mapa:* https://www.google.com/maps?q=${ubicacion}` : "• *Ubicación:* Pendiente de coordinar"}`;

    // Cuerpo para CONSULTA
    const cuerpoConsulta = `
*PRODUCTO:*
• ${producto.nombre.toUpperCase()}
• Estado: ${producto.estado === "usado" ? "Usado / Outlet" : "Nuevo / Sellado"}

*Duda:* Hola, tengo una consulta sobre este artículo...`;

    // ─── MENSAJE FINAL ───
    const mensajeCompleto = `¡Hola *KAORI STORE*! 👋

${titulo}
${separador}
${accion === "compra" ? cuerpoCompra : cuerpoConsulta}
${separador}

_Enviado desde: kaoristore.shop_
_Fecha: ${fecha}_`;

    // Abrir WhatsApp
    const link = `https://wa.me/59174244882?text=${encodeURIComponent(mensajeCompleto)}`;
    window.open(link, "_blank");
  };
  return (
    <>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 300 }}
        className="fixed inset-0 bg-[#FFF9F5] z-[60] flex flex-col overflow-hidden font-sans shadow-2xl"
      >
        {/* HEADER FIJO */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-[70] shadow-sm">
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-[#1F2937] text-2xl font-black bg-[#FFF9F5] rounded-2xl active:scale-90 transition-all"
          >
            ✕
          </button>
          <div className="flex flex-col items-center">
            <h1
              translate="no"
              className="text-lg font-[1000] italic uppercase tracking-tighter text-[#1F2937]"
            >
              KAORI <span className="text-[#F97316]">STORE</span>
            </h1>
            <div className="h-[2px] w-12 bg-[#F97316] rounded-full mt-0.5" />
          </div>
          <button
            onClick={() => enviarWhatsApp("consulta")}
            className="w-12 h-12 flex items-center justify-center text-2xl bg-orange-50 rounded-2xl text-[#F97316]"
          >
            💬
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-4 space-y-6 scroll-smooth"
          style={{ paddingBottom: "160px" }}
        >
          {/* GALERÍA */}
          {/* GALERÍA - CON ROTACIÓN AUTOMÁTICA */}
          <div
            className="relative w-full bg-white rounded-[3rem] overflow-hidden shadow-sm border border-orange-50"
            style={{ height: "40vh" }}
            ref={galleryRef}
          >
            <motion.div
              className="w-full h-full flex items-center p-8 cursor-pointer"
              style={{ x: dragX }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                const threshold = 70;
                if (info.offset.x > threshold && indexFoto > 0)
                  setIndexFoto(indexFoto - 1);
                else if (
                  info.offset.x < -threshold &&
                  indexFoto < fotos.length - 1
                )
                  setIndexFoto(indexFoto + 1);
                dragX.set(0);
              }}
              onClick={() => setShowImageModal(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={indexFoto}
                  src={fotos[indexFoto]}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-full h-full object-contain pointer-events-none ${
                    producto.stock <= 0 ? "grayscale opacity-40" : ""
                  }`}
                  alt="Kaori Store"
                />
              </AnimatePresence>
            </motion.div>

            {/* PUNTOS INDICADORES DINÁMICOS */}
            {fotos.length > 1 && (
              <div className="absolute bottom-6 flex gap-2 left-1/2 -translate-x-1/2 bg-white/60 px-4 py-2.5 rounded-full shadow-sm backdrop-blur-md border border-white/20">
                {fotos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      i === indexFoto ? "w-8 bg-[#F97316]" : "w-2 bg-orange-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 💰 INFO DE PRECIO + CANTIDAD (INTEGRADOS PARA RELLENAR ESPACIO) */}
          <div className="bg-white p-7 rounded-[3rem] shadow-sm border border-orange-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <h2 className="text-[36px] font-[1000] text-[#1F2937] italic leading-none tracking-tighter">
                  <span>{Number(producto.precio).toFixed(2)}Bs </span>
                </h2>
                <span className="text-[10px] text-emerald-600 font-black uppercase mt-1">
                  Disponibilidad Inmediata
                </span>
              </div>

              {/* CANTIDAD MINI-PILL INTEGRADA AQUÍ ARRIBA */}
              <div className="flex items-center gap-4 bg-[#FFF9F5] rounded-2xl p-1.5 border border-orange-100 shadow-inner">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-8 h-8 font-black text-[#F97316] text-xl active:scale-75 transition"
                >
                  -
                </button>
                <span className="text-lg font-[1000] text-[#1F2937] w-4 text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-8 h-8 font-black text-[#F97316] text-xl active:scale-75 transition"
                >
                  +
                </button>
              </div>
            </div>

            <h3 className="text-[20px] font-[1000] text-[#1F2937] uppercase italic leading-tight tracking-tighter border-t border-gray-50 pt-4">
              {producto.nombre}
            </h3>
          </div>

          {/* TABS NAVEGACIÓN */}

          <div className="flex gap-8 px-6 border-b border-orange-100">
            {["detalle", "envío", "garantía"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[12px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? "text-[#F97316] border-b-2 border-[#F97316]" : "text-gray-400"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CONTENIDO TABS */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === "detalle" && (
                <motion.div
                  key="det"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white p-7 rounded-[2.5rem] border border-orange-50 shadow-sm relative overflow-hidden">
                    {/* Decoración de fondo para que no se vea plano */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12" />

                    <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.25em] mb-5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse" />
                      Ficha Técnica y Detalles
                    </p>

                    <div className="space-y-4">
                      {/* Descripción Principal con mejor estilo */}
                      <div className="relative">
                        <div className="relative py-2">
                          {" "}
                          {/* Contenedor para que el absolute funcione bien */}
                          {/* Comilla de Apertura */}
                          <span className="text-4xl text-orange-100 absolute -top-4 -left-2 font-serif select-none">
                            “
                          </span>
                          <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100/50">
                            <p className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] mb-4">
                              Descripción del Producto
                            </p>
                            <div className="text-gray-700 text-sm leading-loose whitespace-pre-line italic font-medium">
                              {producto.descripcion}
                            </div>
                          </div>
                          {/* Comilla de Cierre - Corregida a la derecha y abajo */}
                          <span className="text-4xl text-orange-100 absolute -bottom-6 -right-2 font-serif select-none">
                            ”
                          </span>
                        </div>
                      </div>

                      {/* MINI TABLA DE ATRIBUTOS (Esto llena el vacío y da seriedad) */}
                      <div className="grid grid-cols-1 gap-2 pt-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Disponibilidad
                          </span>
                          <div className="text-right">
                            <span
                              className={`text-[11px] font-black uppercase ${
                                producto.stock <= 3 && producto.stock > 0
                                  ? "text-orange-500 animate-pulse"
                                  : producto.stock > 0
                                    ? "text-[#1F2937]"
                                    : "text-red-500"
                              }`}
                            >
                              {producto.stock > 0
                                ? `${producto.stock} Unidades en stock`
                                : "Sin stock inmediato"}
                            </span>

                            {/* Mensaje de urgencia si quedan 3 o menos */}
                            {producto.stock <= 3 && producto.stock > 0 && (
                              <p className="text-[8px] font-black text-orange-400 uppercase leading-none mt-1">
                                ¡Últimas unidades!
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Despacho
                          </span>
                          <span className="text-[11px] font-black text-orange-600 uppercase">
                            Inmediato (24-48 hrs)
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Estado
                          </span>
                          <span
                            className={`text-[11px] font-black uppercase italic ${
                              producto.estado === "usado"
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {producto.estado === "usado"
                              ? "Usado"
                              : "Nuevo"}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Verificación al final del bloque */}
                      <div className="mt-4 flex items-center gap-2 bg-[#FFF9F5] p-3 rounded-2xl border border-orange-100/50">
                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-xs">✨</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase leading-none">
                          Cada unidad es revisada antes de su despacho.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "envío" && (
                <motion.div
                  key="env"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Card Principal: Ubicación y Estado */}
                  <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center gap-6 bg-white border-b border-gray-50">
                      {/* Icono Técnico en lugar de Emoji */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                          <svg
                            className="w-7 h-7 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                            />
                          </svg>
                        </div>
                        {/* Punto de estado real */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-[1000] text-slate-900 uppercase tracking-tight">
                            Servicio de Entrega
                          </p>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Oficial
                          </span>
                        </div>

                        {/* Info Dinámica (Local o Nacional) */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                              Modo:
                            </p>
                            <p className="text-[11px] text-slate-700 font-[900] uppercase">
                              {regionNombre === "Cochabamba"
                                ? "Entrega Inmediata (Local)"
                                : "Despacho por Transporte (Nacional)"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                              Destino:
                            </p>
                            <span className="text-[11px] text-orange-600 font-black uppercase underline decoration-orange-200 decoration-2 underline-offset-2">
                              {regionNombre || "Pendiente de Destino"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div ref={gpsRef} className="w-full pt-2">
                      {/* Botón GPS Mejorado */}
                      {/* ─── BLOQUE DE UBICACIÓN INTELIGENTE ─── */}
                      <div ref={gpsRef} className="w-full pt-2">
                        <div className="w-full space-y-3">
                          {/* 1. MENSAJE DE AYUDA (Se activa si el GPS falla o no hay ubicación) */}
                          {!ubicacion && !loadingGps && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-orange-50/50 border border-orange-100 p-4 rounded-3xl flex items-start gap-3"
                            >
                              <span className="text-xl">💡</span>
                              <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                                Si el GPS no carga o prefieres no usarlo, puedes
                                <span className="text-[#F97316] ml-1">
                                  escribir tu ciudad manualmente
                                </span>{" "}
                                aquí abajo.
                              </p>
                            </motion.div>
                          )}

                          {/* 2. EL BOTÓN GPS (NUEVA VERSIÓN BLINDADA) */}
                          {!ubicacion && !modoManual && (
                            <div className="space-y-3">
                              <button
                                disabled={loadingGps}
                                onClick={vincularGps}
                                className={`w-full overflow-hidden relative group transition-all duration-500 border-2 rounded-[2rem] p-[3px] 
        ${
          loadingGps
            ? "bg-gray-100 border-gray-200 cursor-wait"
            : "bg-orange-50/50 border-[#F97316] shadow-lg animate-pulse active:scale-95"
        }`}
                              >
                                <div
                                  className={`flex items-center justify-between px-5 py-5 rounded-[1.7rem] transition-colors ${loadingGps ? "bg-gray-50" : "bg-white"}`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${loadingGps ? "bg-gray-300" : "bg-[#F97316] shadow-orange-200"}`}
                                    >
                                      {loadingGps ? (
                                        <span className="animate-spin text-xl text-white">
                                          ⏳
                                        </span>
                                      ) : (
                                        <span className="text-xl text-white">
                                          📍
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <p
                                        className={`text-[10px] font-black uppercase tracking-[2px] leading-none ${loadingGps ? "text-gray-400" : "text-[#F97316]"}`}
                                      >
                                        {loadingGps
                                          ? "Sincronizando..."
                                          : "Punto de Entrega"}
                                      </p>
                                      <p className="text-[14px] font-[1000] text-slate-800 mt-1 uppercase italic tracking-tighter">
                                        {loadingGps
                                          ? "Buscando satélite..."
                                          : "¡Tocar aquí para continuar!"}
                                      </p>
                                    </div>
                                  </div>
                                  {!loadingGps && (
                                    <div className="bg-orange-100 text-[#F97316] px-3 py-1 rounded-full text-[9px] font-black uppercase animate-bounce border border-orange-200">
                                      Necesario
                                    </div>
                                  )}
                                </div>
                              </button>

                              <button
                                onClick={() => setModoManual(true)}
                                className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#F97316] transition-colors"
                              >
                                — o escribir ciudad manualmente —
                              </button>
                            </div>
                          )}

                          {/* 3. PLAN B: INPUT MANUAL (Ahora con diseño premium) */}
                          {!ubicacion && modoManual && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white border-2 border-orange-100 p-6 rounded-[2.5rem] shadow-xl"
                            >
                              <p className="text-[11px] font-black text-[#F97316] uppercase mb-4 px-2 tracking-tighter">
                                Ingresa tu Ciudad o Pueblo:
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Ej: La Paz, El Alto"
                                  value={ciudadManual}
                                  onChange={(e) =>
                                    setCiudadManual(e.target.value)
                                  }
                                  className="flex-1 bg-[#FFF9F5] border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#F97316] placeholder:text-gray-300 shadow-inner"
                                />
                                <button
                                  onClick={() => {
                                    if (ciudadManual.length > 2) {
                                      localStorage.setItem(
                                        "ubicacion_kaori",
                                        "manual",
                                      );
                                      localStorage.setItem(
                                        "region_kaori",
                                        ciudadManual,
                                      );
                                      window.location.reload();
                                    }
                                  }}
                                  className="bg-[#1F2937] text-white px-6 rounded-2xl font-black text-xs active:scale-90 transition-transform shadow-lg shadow-gray-200"
                                >
                                  OK
                                </button>
                              </div>
                              <button
                                onClick={() => setModoManual(false)}
                                className="mt-4 text-[9px] text-gray-400 uppercase font-black block w-full text-center"
                              >
                                Volver al GPS
                              </button>
                            </motion.div>
                          )}

                          {/* 4. ÉXITO (El bloque verde que ya conoces) */}
                          {ubicacion && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-emerald-500 text-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-lg shadow-emerald-100 border-2 border-emerald-400"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                                  📍
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black uppercase opacity-80">
                                    Logística Confirmada:
                                  </span>
                                  <span className="text-[14px] font-[1000] italic uppercase mt-1">
                                    {regionNombre}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  localStorage.removeItem("ubicacion_kaori");
                                  localStorage.removeItem("region_kaori");
                                  window.location.reload();
                                }}
                                className="bg-white/20 px-3 py-2 rounded-xl text-[9px] font-black uppercase"
                              >
                                Cambiar
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Info de Tiempos y Garantía */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-4 rounded-[1.8rem] border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase">
                            Tiempo Estimado de envío
                          </p>
                          <p className="text-[12px] font-black text-gray-700 mt-1">
                            24 - 48 Horas
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-[1.8rem] border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase">
                            Seguridad
                          </p>
                          <p className="text-[12px] font-black text-gray-700 mt-1">
                            Entrega Garantizada
                          </p>
                        </div>
                      </div>

                      {/* Diferenciación de Envío (Lo que hablamos antes) */}
                      <div className="bg-slate-50 border border-slate-100 rounded-[22px] p-4 flex items-start gap-3">
                        <div className="text-xl">🛡️</div>
                        <div>
                          <p className="text-[10px] font-[1000] text-slate-700 uppercase tracking-wider leading-none">
                            Protección en Ruta
                          </p>
                          <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed mt-2">
                            Ciudades con tracking cuentan con garantía de
                            recepción de 72h. Provincias se coordinan vía
                            transporte regional.
                          </p>
                          <a
                            href="/terminos"
                            className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-emerald-600 uppercase border-b border-emerald-200"
                          >
                            Leer condiciones de envío
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nota de pie */}
                  <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest px-10 leading-relaxed">
                    Todos los despachos se realizan desde nuestro centro
                    logístico en{" "}
                    <span className="text-gray-600">Cochabamba y La Paz</span>.
                  </p>
                </motion.div>
              )}

              {activeTab === "garantía" && (
                <motion.div
                  key="gar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* ── SECCIÓN DE CONFIANZA Y POLÍTICAS KAORI STORE ── */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          stroke: "#059669",
                          bg: "bg-[#f0fdf4] border-[#dcfce7]",
                          title: "Venta Directa",
                          desc: "Sin intermediarios. Recibes exactamente lo que solicitas.",
                          icon: <polyline points="20 6 9 17 4 12" />,
                        },
                        {
                          stroke: "#ea580c",
                          bg: "bg-[#fff7ed] border-[#ffedd5]",
                          title: "Compra Protegida",
                          desc: "Garantía de reembolso en 72h para envíos con seguimiento.",
                          icon: (
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          ),
                        },
                        {
                          stroke: "#2563eb",
                          bg: "bg-[#eff6ff] border-[#dbeafe]",
                          title: "Envíos a Todo el País con seguimiento",
                          desc: "Llegamos a ciudades y provincias de toda Bolivia.",
                          icon: (
                            <>
                              <rect x="1" y="3" width="15" height="13" />
                              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                              <circle cx="5.5" cy="18.5" r="2.5" />
                              <circle cx="18.5" cy="18.5" r="2.5" />
                            </>
                          ),
                        },
                        {
                          stroke: "#7c3aed",
                          bg: "bg-[#f5f3ff] border-[#ede9fe]",
                          title: "Atención al Cliente",
                          desc: "Asesoría personalizada por WhatsApp.",
                          icon: (
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          ),
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="bg-white border border-[#f3f4f6] rounded-[18px] p-3 flex flex-col gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all"
                        >
                          <div
                            className={`w-[32px] h-[32px] rounded-[10px] border flex items-center justify-center ${item.bg}`}
                          >
                            <svg
                              className="w-[16px] h-[16px]"
                              fill="none"
                              stroke={item.stroke}
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              {item.icon}
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-[900] text-[#111827] leading-tight uppercase tracking-tight">
                              {item.title}
                            </p>
                            <p className="text-[9.5px] text-[#6b7280] font-medium leading-tight mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sección Informativa de Envíos Especiales (Más Global y Amigable) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex-shrink-0 flex items-center justify-center text-lg">
                        🌍
                      </div>
                      <div>
                        <p className="text-[10px] font-[1000] text-slate-700 uppercase tracking-wider">
                          Información de Logística Regional
                        </p>
                        <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed mt-1">
                          Para envíos a provincias o destinos con logística
                          simplificada (sin seguimiento digital), la
                          coordinación de recojo se realiza directamente con el
                          transportista asignado. Te recomendamos revisar
                          nuestras políticas de cobertura antes de finalizar tu
                          pedido.
                        </p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <a
                            href="/terminos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg active:scale-[0.95] transition-all shadow-sm"
                          >
                            <span className="text-[10px] font-[1000] uppercase tracking-wide">
                              Políticas de Venta y Entrega
                            </span>
                            <svg
                              className="w-3 h-3 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER FIJO MEJORADO */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-orange-100 px-6 py-6 z-[80] flex gap-3 shadow-[0_-20px_40px_rgba(249,115,22,0.1)] rounded-t-[3.5rem] absolute bottom-0 left-0 right-0">
          <button
            type="button"
            // ─── BLOQUEO TOTAL ───
            disabled={Number(producto.stock) <= 0}
            onClick={() => {
              if (Number(producto.stock) <= 0) return;
              onAgregar({ ...producto, cantidadSeleccionada: cantidad });
              setAgregado(true);
              setTimeout(() => setAgregado(false), 2000);
            }}
            // Mantenemos w-18 fijo para que NO crezca
            className={`relative w-18 h-18 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-lg border-2 ${
              Number(producto.stock) <= 0
                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60" // Estilo Apagado
                : agregado
                  ? "bg-emerald-500 border-emerald-400 shadow-emerald-200"
                  : "bg-white border-orange-50 shadow-orange-100 hover:border-orange-200"
            }`}
          >
            <AnimatePresence mode="wait">
              {Number(producto.stock) <= 0 ? (
                // ─── ÍCONO DE "NO DISPONIBLE" (Mantiene el tamaño) ───
                <motion.div
                  key="no-stock"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-red-500 text-xl font-black leading-none">
                    ✕
                  </span>
                  <span className="text-[7px] font-[1000] text-gray-400 uppercase leading-none">
                    Agotado
                  </span>
                </motion.div>
              ) : agregado ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="cart-icon"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                    className="w-8 h-8 opacity-70 grayscale-[0.2]"
                    alt="Cart"
                  />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F97316] rounded-full border-2 border-white animate-pulse"></span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button
            // ─── BLOQUEO FÍSICO ───
            // Se bloquea si el stock es 0 o menor
            disabled={producto.stock <= 0}
            onClick={() => {
              if (!ubicacion) {
                setActiveTab("envío");
                setTimeout(() => {
                  gpsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 100);
              } else {
                enviarWhatsApp("compra");
              }
            }}
            className={`w-full flex items-center gap-4 rounded-[22px] px-5 py-4 transition-all duration-700 active:scale-[0.96] shadow-lg ${
              producto.stock <= 0
                ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70 shadow-none" // Estilo Agotado
                : ubicacion
                  ? "bg-[#F97316] shadow-orange-500/40 border-transparent"
                  : "bg-white border-[2px] border-orange-100 shadow-sm"
            }`}
          >
            {/* Ícono izquierdo dinámico */}
            <div
              className={`w-[44px] h-[44px] rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                producto.stock <= 0
                  ? "bg-gray-200 text-gray-400"
                  : ubicacion
                    ? "bg-white/20 rotate-[360deg]"
                    : "bg-orange-50 border border-orange-100"
              }`}
            >
              {producto.stock <= 0 ? (
                "🚫"
              ) : ubicacion ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v-1.125c0-.621-.504-1.125-1.125-1.125h-2.25a1.125 1.125 0 00-1.125 1.125V7.5m4.5 0h-4.5m4.5 0v6.75M9 7.5v6.75m0 0h7.5"
                  />
                </svg>
              )}
            </div>

            {/* Texto central dinámico */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span
                className={`text-[15px] font-[1000] uppercase italic tracking-tighter leading-none transition-colors duration-500 ${
                  producto.stock <= 0
                    ? "text-gray-400"
                    : ubicacion
                      ? "text-white"
                      : "text-[#F97316]"
                }`}
              >
                {producto.stock <= 0
                  ? "ARTÍCULO AGOTADO"
                  : ubicacion
                    ? "¡VAMOS A PAGARLO!"
                    : "COMPRALO AHORA"}
              </span>
              <span
                className={`text-[9px] font-black uppercase mt-1.5 tracking-widest transition-colors duration-500 ${
                  producto.stock <= 0
                    ? "text-gray-300"
                    : ubicacion
                      ? "text-white/80"
                      : "text-orange-400"
                }`}
              >
                {producto.stock <= 0
                  ? "No disponible por el momento"
                  : ubicacion
                    ? "Toca para comprar"
                    : "Dinos dónde lo recibes para avanzar"}
              </span>
            </div>

            {/* Icono derecho dinámico */}
            <div className="transition-all duration-500">
              {producto.stock <= 0 ? (
                <span className="text-gray-300">⌛</span>
              ) : ubicacion ? (
                <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              ) : (
                <svg
                  className="w-5 h-5 text-orange-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </motion.div>

      {/* MODAL ZOOM */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={fotos[indexFoto]}
              className="w-full h-full object-contain p-6"
              style={{ touchAction: "pinch-zoom" }}
              alt="Zoom"
            />
            <button className="absolute top-12 right-12 text-white text-2xl font-light bg-white/10 w-10 h-10 rounded-full backdrop-blur-md">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
