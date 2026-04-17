"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface CarritoItem {
  id: number | string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
  stock?: number;
}

interface Props {
  carrito: CarritoItem[];
  setCarrito: (carrito: CarritoItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
  ubicacion: any;
  loadingGps: boolean;
  regionNombre: string;
  vincularGps: () => void;
}

export default function VistaCarrito({
  carrito,
  setCarrito,
  isOpen,
  onClose,
  ubicacion, // <--- AÑADE ESTO
  loadingGps, // <--- AÑADE ESTO
  regionNombre, // <--- AÑADE ESTO
  vincularGps,
}: Props) {
  console.log(
    "IDs actuales en el carrito:",
    carrito.map((i) => i.id),
  );
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ cartOpen: true }, "");
    }
    const manejarAtras = () => {
      if (isOpen) onClose();
    };
    window.addEventListener("popstate", manejarAtras);
    return () => window.removeEventListener("popstate", manejarAtras);
  }, [isOpen, onClose]);
  const total = carrito.reduce((acc, item) => {
    const p = Number(item.precio) || 0;
    const c = Number(item.cantidad) || 0;
    return acc + p * c;
  }, 0);

  const actualizarCantidad = (id: string | number, delta: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.id === id) {
          const stockDisponible = Number(item.stock) || 0;
          const cantidadActual = Number(item.cantidad) || 1;

          // Si intenta subir (+) pero ya llegó al límite de stock
          if (delta > 0 && cantidadActual >= stockDisponible) {
            alert("¡Límite de stock alcanzado!");
            return item;
          }

          const nuevaCantidad = Math.max(1, cantidadActual + delta);
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      }),
    );
  };

  const eliminarItem = (id: string | number) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const finalizarPedidoCompleto = () => {
    const productosAgotados = carrito.filter(
      (item) => (Number(item.stock) || 0) <= 0,
    );

    if (productosAgotados.length > 0) {
      alert(
        `⚠️ ¡Atención! Los siguientes productos se agotaron:\n${productosAgotados.map((p) => p.nombre).join(", ")}\n\nPor favor, elíminarlos del carrito para continuar.`,
      );
      return; // Detenemos todo, no se abre WhatsApp
    }
    // 1. Armamos la lista de productos con formato limpio
    const listaProductos = carrito
      .map(
        (item) =>
          `• *${item.nombre.toUpperCase()}*\n   Subtotal: ${item.cantidad} x ${item.precio} = *BOB ${item.precio * item.cantidad}*`,
      )
      .join("\n\n");

    // 2. Creamos el link de Google Maps usando las coordenadas que rescatamos
    // Usamos la latitud y longitud que guardamos en el estado 'ubicacion'
    const googleMapsLink = ubicacion
      ? `https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`
      : "No proporcionado";

    // 3. Construimos el mensaje final "Kaori Style"
    const cuerpoMensaje = `¡Hola Kaori Store! 👋

*🚀 NUEVO PEDIDO CONFIRMADO*
━━━━━━━━━━━━━━━━━━━━━━

*PRODUCTOS:*
${listaProductos}

━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR:* BOB ${total}
━━━━━━━━━━━━━━━━━━━━━━

*📍 DATOS DE ENTREGA:*
• *Región:* ${regionNombre || "No especificada"}
• *Mapa:* ${googleMapsLink}

_Por favor, confirmar la recepción del pedido para coordinar la entrega._`;

    // 4. Codificamos y abrimos WhatsApp
    const mensajeURL = encodeURIComponent(cuerpoMensaje);
    window.open(`https://wa.me/59174244882?text=${mensajeURL}`);
    // 🔥 LA MAGIA: Vaciamos el carrito después de enviar
    setCarrito([]);

    // Opcional: Cerramos el modal para que el usuario vea de nuevo el catálogo
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="carrito-wrapper-global">
          {" "}
          {/*
          {/* Fondo desenfocado profesional */}
          <motion.div
            key="backdrop-oscuro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              window.history.back();
              onClose();
            }}
            className="fixed inset-0 bg-[#1F2937]/80 backdrop-blur-md z-[90]"
          />
          <motion.div
            key="panel-blanco-carrito"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[440px] bg-white z-[100] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ─── HEADER KAORI STYLE ─── */}
            <div className="relative p-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] overflow-hidden">
              {/* Círculos decorativos de fondo */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-[1000] italic text-white uppercase tracking-tight leading-none">
                    MI <span className="opacity-60">CARRITO</span>
                  </h2>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    {carrito.length} Productos seleccionados
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.history.back();
                    onClose();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-2xl text-white transition-all backdrop-blur-md border border-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ─── LISTA DE PRODUCTOS ─── */}
            {/* ─── LISTA DE PRODUCTOS ─── */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gray-50/50 no-scrollbar">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center text-5xl grayscale opacity-30 shadow-inner">
                    🛒
                  </div>
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest text-center leading-relaxed">
                    Aún no has añadido
                    <br />
                    novedades a tu carrito
                  </p>
                </div>
              ) : (
                carrito.map((item, index) => {
                  const estaAgotado = Number(item.stock) <= 0;

                  return (
                    <motion.div
                      layout
                      key={`item-${item.id || "sin-id"}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-[2.5rem] shadow-[0_10px_30px_rgba(249,115,22,0.05)] border flex gap-5 group relative transition-all ${
                        estaAgotado
                          ? "bg-gray-100 border-gray-200"
                          : "bg-white border-orange-100/50"
                      }`}
                    >
                      {/* Imagen con contenedor limpio */}
                      <div className="w-24 h-24 bg-[#FFF8F1] rounded-[2rem] flex-shrink-0 p-2 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={item.imagen}
                          className={`w-full h-full object-contain mix-blend-multiply ${estaAgotado ? "grayscale opacity-50" : ""}`}
                          alt={item.nombre}
                        />
                        {estaAgotado && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                              Sin Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div>
                          <p className="text-[11px] font-[1000] text-gray-400 uppercase tracking-tighter truncate leading-none mb-1">
                            {item.nombre}
                          </p>
                          {estaAgotado ? (
                            <p className="text-[13px] font-black text-red-500 uppercase italic leading-none">
                              ⚠️ Agotado
                            </p>
                          ) : (
                            <p className="text-2xl font-[1000] text-[#1F2937] italic leading-none tracking-tighter">
                              BOB {Number(item.precio) * Number(item.cantidad)}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          {/* Control de Cantidad Estilo Apple */}
                          <div
                            className={`flex items-center rounded-xl p-1 border ${estaAgotado ? "bg-gray-200 border-gray-300" : "bg-gray-100 border-gray-200"}`}
                          >
                            <button
                              onClick={() => actualizarCantidad(item.id, -1)}
                              disabled={estaAgotado}
                              className="w-8 h-8 font-black text-[#1F2937] active:scale-75 transition-transform disabled:opacity-20"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black text-[#F97316] italic">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(item.id, 1)}
                              disabled={estaAgotado}
                              className="w-8 h-8 font-black text-[#1F2937] active:scale-75 transition-transform disabled:opacity-20"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => eliminarItem(item.id)}
                            className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ─── FOOTER TICKET KAORI ─── */}
            {carrito.length > 0 && (
              <div className="p-8 bg-white border-t border-gray-100 rounded-t-[4rem] shadow-[0_-30px_60px_rgba(0,0,0,0.08)]">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                      Subtotal
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      BOB {total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                      Enviar a:
                    </span>

                    {/* Este es el Badge Interactivo */}
                    <button
                      onClick={vincularGps}
                      disabled={loadingGps}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all duration-500 flex items-center gap-2 shadow-sm ${
                        loadingGps
                          ? "bg-orange-100 text-orange-500 animate-pulse"
                          : ubicacion
                            ? "bg-emerald-500 text-white shadow-emerald-200"
                            : "bg-orange-500 text-white animate-bounce shadow-orange-200"
                      }`}
                    >
                      {loadingGps ? (
                        <>
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                          Buscando...
                        </>
                      ) : ubicacion ? (
                        <>
                          <span>📍</span>
                          {regionNombre || "Detectado"} ✓
                        </>
                      ) : (
                        <>
                          <span></span>
                          Toca aqui para saber donde te lo enviamos
                        </>
                      )}
                    </button>
                  </div>

                  {/* Línea divisoria de ticket */}
                  <div className="h-[2px] w-full border-t-2 border-dashed border-gray-100 my-4" />

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-[#F97316] uppercase italic tracking-widest leading-none mb-1">
                        Total a Pagar
                      </span>
                      <span className="text-4xl font-[1000] text-[#1F2937] italic tracking-tighter leading-none">
                        BOB {total}
                      </span>
                    </div>
                    <div className="bg-[#FFF8F1] p-3 rounded-2xl">
                      <span className="text-2xl">🧾</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={finalizarPedidoCompleto}
                  // ─── EL CANDADO ───
                  disabled={!ubicacion || loadingGps}
                  className={`w-full py-6 rounded-[2.5rem] transition-all flex flex-col items-center justify-center group overflow-hidden relative ${
                    !ubicacion || loadingGps
                      ? "bg-gray-200 cursor-not-allowed text-gray-400 border-2 border-gray-100" // Estilo bloqueado
                      : "bg-[#1F2937] text-white shadow-2xl shadow-orange-500/20 active:scale-[0.97] cursor-pointer" // Estilo Kaori Activo
                  }`}
                >
                  {/* El brillo (shimmer) solo aparece si ya hay ubicación */}
                  {ubicacion && !loadingGps && (
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  )}

                  <span className="text-[19px] font-[1000] uppercase italic tracking-widest leading-none relative z-10">
                    {loadingGps
                      ? "VALIDANDO..."
                      : !ubicacion
                        ? "VINCULA TU UBICACIÓN"
                        : "COMPRAR AHORA"}
                  </span>

                  <p className="text-[9px] font-bold uppercase mt-2 tracking-widest relative z-10">
                    {!ubicacion
                      ? "Necesario para el envío"
                      : loadingGps
                        ? "Buscando tu posición"
                        : "¡Vamos a pagarlo!"}
                  </p>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </AnimatePresence>
  );
}
