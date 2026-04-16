"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

interface Props {
  producto: any;
  onClose: () => void;
  onAgregar: (p: any) => void;
}

export default function ModalDetalle({ producto, onClose, onAgregar }: Props) {
  // ─── ESTADOS DE CONTROL ───
  const [indexFoto, setIndexFoto] = useState(0);
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [regionNombre, setRegionNombre] = useState<string>(
    "Bolivia (Sin vincular)",
  );
  const [loadingGps, setLoadingGps] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("detalle");

  const fotos = producto.galeria
    ? [producto.imagen, ...producto.galeria.split(",").filter(Boolean)]
    : [producto.imagen];

  const galleryRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // ─── BLOQUEO DE SCROLL DEL BODY ───
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // ─── LÓGICA GPS DIRECTA ───
  const obtenerUbicacion = () => {
    setLoadingGps(true);
    if (!navigator.geolocation) {
      setLoadingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUbicacion(`https://www.google.com/maps?q=${latitude},${longitude}`);

        // Detección de Región para Bolivia (Simpificada)
        if (
          latitude > -18 &&
          latitude < -16.5 &&
          longitude > -67 &&
          longitude < -65.5
        ) {
          setRegionNombre("Cochabamba y Valles");
        } else if (
          latitude > -17 &&
          latitude < -15.5 &&
          longitude > -69 &&
          longitude < -67.5
        ) {
          setRegionNombre("La Paz / Altiplano");
        } else if (
          latitude > -18.5 &&
          latitude < -17 &&
          longitude > -64 &&
          longitude < -62
        ) {
          setRegionNombre("Santa Cruz / Oriente");
        } else {
          setRegionNombre("Ubicación Detectada ✅");
        }
        setLoadingGps(false);
      },
      () => {
        setLoadingGps(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const enviarWhatsApp = (accion: "compra" | "consulta") => {
    const gpsPart = ubicacion
      ? `\n📍 *Ubicación (${regionNombre}):* ${ubicacion}`
      : "\n📍 *Región:* Por coordinar";
    const total = producto.precio * cantidad;
    const text = `¡Hola Kaori Store! 👋\n${accion === "compra" ? "*SOLICITUD DE COMPRA*" : "*CONSULTA DE PRODUCTO*"} \n📦 *Art:* ${producto.nombre.toUpperCase()}\n🔢 *Cant:* ${cantidad}\n💰 *Total:* BOB ${total}${gpsPart}\n\n_Hecho en KaoriStore.bo_`;
    window.open(`https://wa.me/59174244882?text=${encodeURIComponent(text)}`);
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
                  className="w-full h-full object-contain pointer-events-none"
                  alt="Kaori Store"
                />
              </AnimatePresence>
            </motion.div>
            {fotos.length > 1 && (
              <div className="absolute bottom-6 flex gap-2 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md">
                {fotos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === indexFoto ? "w-8 bg-[#F97316]" : "w-2 bg-orange-200"}`}
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
                  BOB {producto.precio}
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
                          <p className="text-[14px] text-gray-600 font-medium leading-relaxed italic px-6 relative z-10">
                            {producto.descripcion ||
                              "Especificaciones de alta gama seleccionadas para el mercado boliviano. Calidad garantizada por Kaori Store."}
                          </p>
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
                          <span className="text-[11px] font-black text-[#1F2937] uppercase">
                            {producto.stock > 0
                              ? "Inmediata (Stock Real)"
                              : "Consultar"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Interés
                          </span>
                          <span className="text-[11px] font-black text-[#1F2937] uppercase">
                            {producto.consultas || 0} Consultas hoy
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Estado
                          </span>
                          <span className="text-[11px] font-black text-emerald-600 uppercase italic">
                            Nuevo / Sellado
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
                              Destino vinculado:
                            </p>
                            <span className="text-[11px] text-orange-600 font-black uppercase underline decoration-orange-200 decoration-2 underline-offset-2">
                              {regionNombre || "Pendiente de Sincronización"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Botón GPS Mejorado */}
                      <button
                        onClick={obtenerUbicacion}
                        className={`w-full overflow-hidden relative group transition-all duration-300 ${
                          ubicacion
                            ? "bg-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-white border-slate-200 shadow-sm active:bg-slate-50"
                        } border-2 rounded-2xl p-[2px]`}
                      >
                        <div
                          className={`flex items-center justify-between px-5 py-4 rounded-[14px] ${
                            ubicacion ? "bg-emerald-50/30" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Icono de Radar/GPS Dinámico */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                ubicacion
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {loadingGps ? (
                                <svg
                                  className="animate-spin h-5 w-5"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                  />
                                </svg>
                              )}
                            </div>

                            <div className="text-left">
                              <p
                                className={`text-[10px] font-black uppercase tracking-[1.5px] leading-none ${
                                  ubicacion
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {loadingGps
                                  ? "Protocolo de Rastreo"
                                  : "Ubicación"}
                              </p>
                              <p className="text-[12px] font-[1000] text-slate-800 mt-1.5 uppercase">
                                {loadingGps
                                  ? "Sincronizando..."
                                  : ubicacion
                                    ? "Ubicación Verificada"
                                    : "Vincular GPS para Envío"}
                              </p>
                            </div>
                          </div>

                          {/* Indicador de Estado Lado Derecho */}
                          <div className="flex flex-col items-end">
                            {ubicacion ? (
                              <div className="flex items-center gap-1.5">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-black text-emerald-600 uppercase">
                                  Online
                                </span>
                              </div>
                            ) : (
                              <svg
                                className="w-4 h-4 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>

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
            onClick={() => {
              onAgregar(producto);
              alert("Añadido 🛒");
            }}
            className="w-18 h-18 bg-white border-2 border-orange-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-sm active:scale-90 transition-all"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
              className="w-8 h-8 opacity-40"
              alt="Cart"
            />
          </button>

          <button
            onClick={() => enviarWhatsApp("compra")}
            className="flex-1 bg-[#F97316] text-white rounded-[2rem] flex flex-col items-center justify-center shadow-2xl shadow-orange-500/30 active:scale-[0.97] transition-all py-5"
          >
            <span className="text-[18px] font-[1000] uppercase italic tracking-widest leading-none">
              CERRAR PEDIDO
            </span>
            <span className="text-[9px] font-bold opacity-80 uppercase tracking-[0.2em] mt-2">
              PAGO QR / TRANSFERENCIA
            </span>
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
