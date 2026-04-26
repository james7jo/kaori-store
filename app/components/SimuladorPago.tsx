"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── CONFIGURACIÓN — cambia estos 4 valores ──────────────────────────────────
const WHATSAPP_1 = "59174244882";
const WHATSAPP_2 = "59169956510";
const CLOUDINARY_CLOUD = "dh1xm1ov8";
const CLOUDINARY_PRESET = "kj9fyfgf";
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  total: number;
  onClose: () => void;
  regionNombre: string;
  productoNombre: string;
  cantidad: number;
  ubicacionGps: string;
  precioUnitario: number;
}
interface CarritoItem {
  id: number | string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  stock?: number;
}
interface Props {
  total: number;
  onClose: () => void;
  regionNombre: string;
  ubicacionGps: string;
  carrito: CarritoItem[]; // ← todo el carrito
  onPedidoConfirmado: () => void; // ← para vaciar carrito al final
}

interface PedidoGuardado {
  id: string;
  nombre: string;
  celular: string;
  producto: string;
  cantidad: number;
  total: number;
  region: string;
  coordenadas: { lat: number; lng: number } | null;
  imagenUrl: string;
  fecha: string;
  estado: "pendiente" | "verificado" | "rechazado";
}

async function subirACloudinary(archivo: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "kaori_comprobantes");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!res.ok) throw new Error("Error al subir");
  const data = await res.json();
  return data.secure_url as string;
}

function guardarPedido(pedido: PedidoGuardado) {
  const existentes = JSON.parse(
    localStorage.getItem("kaori_pedidos") || "[]",
  ) as PedidoGuardado[];
  existentes.unshift(pedido);
  localStorage.setItem("kaori_pedidos", JSON.stringify(existentes));
}

export default function SimuladorPago({
  total,
  onClose,
  regionNombre,
  productoNombre,
  cantidad,
  ubicacionGps,
  precioUnitario,
  carrito,
  onPedidoConfirmado,
}: Props) {
  const [paso, setPaso] = useState(1);
  const router = useRouter(); // <--- AÑADE ESTO
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState("");
  const [mostrarGracias, setMostrarGracias] = useState(false);

  // Ubicación — guardamos texto Y coordenadas separados
  const [ubicacionTexto, setUbicacionTexto] = useState(regionNombre || "");
  const [coordenadas, setCoordenadas] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [modoManualUbic, setModoManualUbic] = useState(false);
  const [inputUbicManual, setInputUbicManual] = useState("");

  // ─── Cargar datos guardados en localStorage ──────────────────────────────
  useEffect(() => {
    const n = localStorage.getItem("kaori_nombre");
    const c = localStorage.getItem("kaori_celular");
    if (n) setNombre(n);
    if (c) setCelular(c);
  }, []);

  // ─── Preview imagen ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!archivo) return;
    const url = URL.createObjectURL(archivo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const lanzarConfeti = () => {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#F97316", "#EA580C", "#000"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#F97316", "#EA580C", "#000"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  // ─── GPS — guarda texto + coordenadas exactas ─────────────────────────────
  const obtenerGps = () => {
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Guardamos las coordenadas para el link de Maps
        setCoordenadas({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
          );
          const data = await res.json();
          const ciudad =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Ciudad desconocida";
          const provincia = data.address?.state || data.address?.county || "";
          setUbicacionTexto(`${ciudad}, ${provincia}`);
        } catch {
          setUbicacionTexto("No se pudo obtener dirección");
        } finally {
          setLoadingGps(false);
        }
      },
      () => {
        setLoadingGps(false);
        setModoManualUbic(true);
      },
      { timeout: 10000 },
    );
  };

  // ─── Confirmar: subir → guardar → abrir WhatsApp ──────────────────────────
  const confirmarPago = async () => {
    if (!archivo) return;
    setSubiendo(true);
    setErrorSubida("");
    try {
      const imagenUrl = await subirACloudinary(archivo);

      localStorage.setItem("kaori_nombre", nombre);
      localStorage.setItem("kaori_celular", celular);

      const pedido: PedidoGuardado = {
        id: `KAO-${Date.now()}`,
        nombre,
        celular,
        producto: productoNombre,
        cantidad,
        total,
        region: ubicacionTexto,
        coordenadas,
        imagenUrl,
        fecha: new Date().toLocaleString("es-BO"),
        estado: "pendiente",
      };
      guardarPedido(pedido);

      // ─── LÓGICA DE LINK DE MAPA ULTRA PRECISO ──────────────────────────────────
      // Prioridad 1: Coordenadas nuevas del botón interno
      // Prioridad 2: link directo que viene por props (ubicacionGps)
      // Prioridad 3: Texto de la región (si no hay GPS)

      let linkMaps = "";

      if (coordenadas) {
        linkMaps = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`;
      } else if (ubicacionGps && ubicacionGps.includes(",")) {
        // Si recibimos el link sucio de googleusercontent, limpiamos solo las coordenadas
        const coordsLimpia =
          ubicacionGps.split("q=")[1] || ubicacionGps.split("com/")[1] || "";
        linkMaps = `https://www.google.com/maps?q=${coordsLimpia}`;
      } else {
        linkMaps = `https://www.google.com/maps/search/${encodeURIComponent(ubicacionTexto)}`;
      }
      // ─────────────────────────────────────────────────────────────────────────────

      const separador = "━━━━━━━━━━━━━━━━━━━━";
      const detalleProductos =
        carrito && carrito.length > 0
          ? carrito
              .map((item) => `• ${item.cantidad}x ${item.nombre.toUpperCase()}`)
              .join("\n")
          : `• ${cantidad}x ${productoNombre.toUpperCase()}`;

      const mensaje =
        `🧾 *NUEVO PEDIDO — KAORI STORE*\n${separador}\n` +
        `*ID:* ${pedido.id}\n` +
        `*Cliente:* ${nombre}\n` +
        `*Celular:* +591 ${celular}\n\n` +
        `*PRODUCTOS:*\n${detalleProductos}\n\n` +
        `*TOTAL A PAGAR:* ${Number(total).toFixed(2)} Bs\n\n` +
        `*📍 Dirección:* ${ubicacionTexto}\n` +
        `*📌 Mapa exacto:* ${linkMaps}\n` +
        `\n*📷 Comprobante:* ${imagenUrl}\n` +
        `${separador}\n_${pedido.fecha}_`;

      const encoded = encodeURIComponent(mensaje);

      window.open(`https://wa.me/${WHATSAPP_1}?text=${encoded}`, "_blank");

      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_2}?text=${encoded}`, "_blank");
      }, 900);

      setPaso(4);
      lanzarConfeti();
    } catch {
      setErrorSubida("Error al subir el comprobante. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const StepBar = () => (
    <div className="flex items-center gap-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
              paso > i
                ? "bg-emerald-500 text-white"
                : paso === i
                  ? "bg-[#F97316] text-white shadow-md shadow-orange-200"
                  : "bg-[#E8E5DF] text-[#A09890]"
            }`}
          >
            {paso > i ? "✓" : i}
          </div>
          {i === 1 && (
            <div
              className={`w-8 h-[2px] rounded-full transition-all duration-700 ${
                paso >= 2 ? "bg-[#F97316]" : "bg-[#E8E5DF]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const inputStyle =
    "w-full bg-[#F8F7F4] border border-[#E8E5DF] rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all placeholder:text-[#C4BFB6] text-[#1A1A1A]";

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      {/* Backdrop — click afuera cierra */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden max-h-[95vh] overflow-y-auto"
        style={{ boxShadow: "0 -8px 60px rgba(0,0,0,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C]" />

        {/* Header */}
        <div className="px-7 pt-5 pb-4 border-b border-[#F0EDE8] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F97316]">
              KAORI STORE
            </span>
            <h2 className="text-[20px] font-[900] text-[#1A1A1A] tracking-tight leading-none mt-0.5">
              {paso === 1
                ? "Confirmar pedido"
                : paso === 2
                  ? "Realizar pago"
                  : "¡Pedido listo!"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {paso < 3 && <StepBar />}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-[#F0EDE8] flex items-center justify-center text-[#6B6560] hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ════════════════════════════════
              PASO 1 — DATOS + UBICACIÓN
          ════════════════════════════════ */}
          {paso === 1 && (
            <motion.div
              key="p1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-7 py-6 flex flex-col gap-5"
            >
              {/* Resumen pedido — muestra cantidad */}
              <div className="bg-[#FAFAF8] border border-[#EDEAE4] rounded-[1.5rem] p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🛍️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-[#A09890] tracking-wider mb-0.5">
                    Producto
                  </p>
                  <p className="text-[12px] font-bold text-[#1A1A1A] truncate uppercase">
                    {productoNombre}
                  </p>
                  {/* Cantidad visible */}
                  <p className="text-[10px] font-black text-[#F97316] mt-0.5 uppercase">
                    {cantidad} unidad{cantidad > 1 ? "es" : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-black uppercase text-[#A09890]">
                    Total
                  </p>
                  <p className="text-[20px] font-[900] text-[#F97316] leading-none">
                    {Number(total).toFixed(2)}
                    <span className="text-[11px] ml-0.5">Bs</span>
                  </p>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#A09890] tracking-wider ml-1 mb-2 block">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={inputStyle}
                />
              </div>

              {/* Celular */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#A09890] tracking-wider ml-1 mb-2 block">
                  Número de celular
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-black text-[#6B6560]">
                    🇧🇴 +591
                  </span>
                  <input
                    type="tel"
                    placeholder="78945612"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    className={`${inputStyle} pl-[4.5rem]`}
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#A09890] tracking-wider ml-1 mb-2 block">
                  Dirección de entrega
                </label>

                {ubicacionTexto && !modoManualUbic ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                    <span className="text-lg flex-shrink-0">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase text-emerald-500 leading-none">
                        {coordenadas ? "GPS confirmado" : "Confirmada"}
                      </p>
                      <p className="text-[13px] font-[900] text-emerald-800 mt-0.5 truncate">
                        {ubicacionTexto}
                      </p>
                      {/* Link Maps si hay coordenadas en el Paso 4 */}
                      {/* Esto usa las coordenadas del modal O el link que ya traíamos de la página principal */}
                      {(coordenadas || ubicacionGps) && (
                        <a
                          href={
                            coordenadas
                              ? `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`
                              : ubicacionGps
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-wider underline underline-offset-2"
                        >
                          📌 Ver pin de entrega en Google Maps
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUbicacionTexto("");
                        setCoordenadas(null);
                        setModoManualUbic(false);
                      }}
                      className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : modoManualUbic ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Cochabamba, Sacaba"
                      value={inputUbicManual}
                      onChange={(e) => setInputUbicManual(e.target.value)}
                      className={inputStyle}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (inputUbicManual.length > 2) {
                            setUbicacionTexto(inputUbicManual);
                            setCoordenadas(null); // manual no tiene coords exactas
                            setModoManualUbic(false);
                          }
                        }}
                        className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl font-black text-[11px] uppercase active:scale-95 transition-all"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setModoManualUbic(false)}
                        className="px-4 py-3 bg-[#F0EDE8] text-[#6B6560] rounded-xl font-black text-[11px] uppercase active:scale-95 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={obtenerGps}
                      disabled={loadingGps}
                      className="w-full flex items-center gap-4 bg-[#F8F7F4] border-2 border-[#F97316] rounded-2xl px-5 py-4 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center flex-shrink-0">
                        {loadingGps ? (
                          <span className="animate-spin text-white text-base">
                            ⏳
                          </span>
                        ) : (
                          <span className="text-white text-base">📍</span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-[#F97316] tracking-wider leading-none">
                          {loadingGps ? "Buscando..." : "Usar GPS"}
                        </p>
                        <p className="text-[13px] font-[900] text-[#1A1A1A] mt-0.5">
                          {loadingGps
                            ? "Aguarda un momento"
                            : "Pin exacto en Google Maps"}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setModoManualUbic(true)}
                      className="text-[11px] font-black text-[#A09890] uppercase tracking-wider text-center hover:text-[#F97316] transition-colors"
                    >
                      — o escribir dirección manualmente —
                    </button>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              {/* GARANTÍAS + POLÍTICAS */}
              <div className="bg-white rounded-[20px] border border-[#EDEAE4] p-4 flex flex-col gap-2.5">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Pago seguro",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ),
                    },
                    {
                      label: "Envío garantizado",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                          <path d="M16.5 9.4 7.55 4.24" />
                          <polyline points="3.29 7 12 12 20.71 7" />
                          <line x1="12" y1="22" x2="12" y2="12" />
                        </svg>
                      ),
                    },
                    {
                      label: "Verificado",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                      ),
                    },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="bg-[#FAFAF8] border border-[#EDEAE4] rounded-[14px] p-3 flex flex-col items-center gap-1.5"
                    >
                      <div className="w-[34px] h-[34px] rounded-[10px] bg-orange-50 flex items-center justify-center">
                        {b.icon}
                      </div>
                      <span className="text-[11px] font-bold text-[#6b5a50] text-center leading-tight">
                        {b.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#EDEAE4] pt-2.5">
                  <button
                    onClick={() => {
                      // Abrimos en una pestaña nueva para no perder el proceso de pago
                      window.open("/terminos", "_blank");
                    }}
                    className="w-full flex items-center justify-between px-[18px] py-[13px] bg-white border-[1.5px] border-orange-400 rounded-2xl hover:bg-orange-50 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span className="text-[13px] font-bold text-orange-500 tracking-tight">
                        Leer políticas de envío
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                disabled={!nombre || celular.length < 7 || !ubicacionTexto}
                onClick={() => setPaso(2)}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-[900] uppercase tracking-tight text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              >
                Continuar al pago →
              </button>

              {!ubicacionTexto && (
                <p className="text-[10px] text-center text-[#F97316] font-bold uppercase -mt-2">
                  ↑ Confirma tu dirección para continuar
                </p>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════
              PASO 2 — QR + COMPROBANTE
          ════════════════════════════════ */}
          {paso === 2 && (
            <motion.div
              key="p2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-7 py-6 flex flex-col gap-5"
            >
              <div className="space-y-2">
                {[
                  "Escanea el código QR con tu app bancaria",
                  "Transfiere el monto exacto indicado",
                  "Toma captura de pantalla del comprobante",
                  "Adjunta la captura abajo para confirmar",
                ].map((txt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#F97316] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[12px] text-[#4A4540] font-semibold leading-snug">
                      {txt}
                    </p>
                  </div>
                ))}
              </div>

              {/* ZONA QR + MONTO */}
              <div className="bg-[#FAFAF8] px-6 pt-6 pb-5 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-md border border-[#E8E5DF] overflow-hidden">
                    <img
                      src="/QR-kaori.jpeg"
                      className="w-64 h-64 object-contain block mx-auto p-4"
                      alt="QR Pago"
                    />
                    {/* Botón descarga — fondo naranja para que no se pierda */}
                    <a
                      href="/QR-kaori.jpeg"
                      download="QR-Kaori.jpeg"
                      className="flex items-center justify-center gap-2 py-3 bg-[#FFF4EC] border-t-2 border-[#F97316] text-[11px] font-black uppercase tracking-widest text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all active:scale-95"
                    >
                      <span>📥</span> Descargar QR para pagar
                    </a>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[9px] font-black uppercase text-[#A09890] tracking-[0.2em] mb-1">
                    Monto exacto a transferir
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-[44px] font-[1000] text-[#1A1A1A] leading-none tracking-tighter">
                      {Number(total).toFixed(2)}
                    </span>
                    <span className="text-[18px] font-black text-[#F97316]">
                      Bs
                    </span>
                  </div>
                </div>
              </div>
              {/* UPLOAD COMPROBANTE */}
              <div className="px-6 pb-6 bg-white">
                <label className="text-[10px] font-black uppercase text-[#A09890] tracking-wider ml-1 mb-2 block">
                  Comprobante de transferencia
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setArchivo(e.target.files?.[0] || null);
                      setErrorSubida("");
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {previewUrl ? (
                    <div className="w-full rounded-2xl overflow-hidden border-2 border-emerald-400 relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 py-2 text-center">
                        <span className="text-[10px] font-black uppercase text-white tracking-wider">
                          ✓ Comprobante listo — toca para cambiar
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full py-6 border-2 border-dashed border-[#D8D4CE] rounded-2xl flex flex-col items-center gap-2 bg-[#FAFAF8] hover:border-[#F97316] transition-colors">
                      <span className="text-2xl">📎</span>
                      <span className="text-[11px] font-black uppercase text-[#6B6560]">
                        Toca para adjuntar imagen
                      </span>
                      <span className="text-[9px] text-[#C4BFB6] font-semibold">
                        JPG, PNG o captura de pantalla
                      </span>
                    </div>
                  )}
                </div>
                {errorSubida && (
                  <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">
                    {errorSubida}
                  </p>
                )}
              </div>

              <button
                disabled={!archivo || subiendo}
                onClick={confirmarPago}
                className="w-full py-4 bg-[#F97316] text-white rounded-2xl font-[900] uppercase tracking-tight text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-200 flex items-center justify-center gap-3"
              >
                {subiendo ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subiendo comprobante...
                  </>
                ) : (
                  "Confirmar transferencia ✓"
                )}
              </button>

              <button
                onClick={() => setPaso(1)}
                className="text-[11px] font-bold text-[#A09890] uppercase tracking-wider text-center w-full hover:text-[#F97316] transition-colors"
              >
                ← Volver al paso anterior
              </button>
            </motion.div>
          )}

          {/* ════════════════════════════════
              PASO 4 — ÉXITO
          ════════════════════════════════ */}
          {paso === 4 && (
            <motion.div
              key="p4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="px-7 py-8 flex flex-col items-center gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </motion.div>

              <div className="text-center">
                <p className="text-[11px] font-black uppercase text-emerald-500 tracking-widest mb-1">
                  Pago recibido
                </p>
                <h3 className="text-[28px] font-[900] text-[#1A1A1A] uppercase tracking-tight leading-none">
                  ¡Pedido
                  <br />
                  confirmado!
                </h3>
              </div>

              {/* Resumen final con cantidad */}
              <div className="w-full bg-[#FAFAF8] border border-[#EDEAE4] rounded-2xl divide-y divide-[#EDEAE4]">
                {[
                  { label: "Cliente", value: nombre },
                  { label: "Celular", value: `+591 ${celular}` },
                  {
                    label: "Producto",
                    value: `${cantidad} × ${productoNombre}`,
                  },
                  { label: "Enviar a", value: ubicacionTexto },
                  {
                    label: "Total pagado",
                    value: `${Number(total).toFixed(2)} Bs`,
                    accent: true,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center px-5 py-3"
                  >
                    <span className="text-[10px] font-black uppercase text-[#A09890] tracking-wider">
                      {row.label}
                    </span>
                    <span
                      className={`text-[12px] font-[900] uppercase truncate max-w-[55%] text-right ${
                        row.accent ? "text-[#F97316]" : "text-[#1A1A1A]"
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Link Maps si hay coordenadas */}
              {coordenadas && (
                <a
                  href={`https://maps.google.com/?q=${coordenadas.lat},${coordenadas.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-wider underline underline-offset-2"
                >
                  📌 Ver pin de entrega en Google Maps
                </a>
              )}

              <p className="text-[11px] text-center text-[#A09890] font-semibold leading-relaxed px-4">
                Te contactaremos al{" "}
                <span className="font-black text-[#1A1A1A]">
                  +591 {celular}
                </span>{" "}
                para coordinar la entrega. Revisa WhatsApp.
              </p>

              <button
                onClick={() => {
                  // Confeti explosivo tipo celebración
                  const count = 200;
                  const defaults = { origin: { y: 0.7 } };

                  function fire(particleRatio: number, opts: object) {
                    confetti({
                      ...defaults,
                      ...opts,
                      particleCount: Math.floor(count * particleRatio),
                      colors: [
                        "#F97316",
                        "#EA580C",
                        "#1A1A1A",
                        "#FFF",
                        "#FBBF24",
                      ],
                    });
                  }

                  fire(0.25, { spread: 26, startVelocity: 55 });
                  fire(0.2, { spread: 60 });
                  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                  fire(0.1, {
                    spread: 120,
                    startVelocity: 25,
                    decay: 0.92,
                    scalar: 1.2,
                  });
                  fire(0.1, { spread: 120, startVelocity: 45 });

                  // Serpentina desde los lados
                  setTimeout(() => {
                    confetti({
                      particleCount: 80,
                      angle: 60,
                      spread: 80,
                      origin: { x: 0 },
                      colors: ["#F97316", "#FBBF24", "#FFF"],
                    });
                    confetti({
                      particleCount: 80,
                      angle: 120,
                      spread: 80,
                      origin: { x: 1 },
                      colors: ["#F97316", "#EA580C", "#FFF"],
                    });
                  }, 300);

                  setTimeout(() => {
                    confetti({
                      particleCount: 60,
                      angle: 60,
                      spread: 70,
                      origin: { x: 0, y: 0.8 },
                      colors: ["#F97316", "#FBBF24"],
                    });
                    confetti({
                      particleCount: 60,
                      angle: 120,
                      spread: 70,
                      origin: { x: 1, y: 0.8 },
                      colors: ["#EA580C", "#FFF"],
                    });
                  }, 600);

                  // Mostrar mensaje y luego cerrar
                  setMostrarGracias(true);
                  setTimeout(() => {
                    onPedidoConfirmado();
                    onClose();
                  }, 3200);
                }}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-[900] uppercase tracking-tight text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-emerald-200"
              >
                Entendido, espero mi pedido 🎉
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY GRACIAS */}
        <AnimatePresence>
          {mostrarGracias && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center gap-6 px-8 rounded-[2.5rem]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, delay: 0.1 }}
                className="text-7xl"
              >
                🎉
              </motion.div>

              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[11px] font-black uppercase tracking-[0.25em] text-[#F97316] mb-2"
                >
                  Kaori Store
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[30px] font-[900] text-[#1A1A1A] uppercase tracking-tight leading-tight"
                >
                  ¡Gracias por
                  <br />
                  confiar en
                  <br />
                  nosotros!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[12px] text-[#A09890] font-semibold mt-3 leading-relaxed"
                >
                  Tu pedido está en camino.
                  <br />
                  Te escribiremos pronto 💛
                </motion.p>
              </div>

              <motion.div className="w-48 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "linear", delay: 0.2 }}
                  className="h-full bg-[#F97316] rounded-full"
                />
              </motion.div>

              <p className="text-[9px] text-[#C4BFB6] font-bold uppercase tracking-widest">
                Cerrando automáticamente...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
