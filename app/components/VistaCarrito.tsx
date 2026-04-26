"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import SimuladorPago from "@/app/components/SimuladorPago";

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
  ubicacion,
  loadingGps,
  regionNombre,
  vincularGps,
}: Props) {
  const [mostrandoPago, setMostrandoPago] = useState(false);
  const [itemEliminando, setItemEliminando] = useState<string | number | null>(
    null,
  );

  const total = carrito.reduce(
    (acc, item) =>
      acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
    0,
  );
  const cantidadTotal = carrito.reduce(
    (acc, item) => acc + (Number(item.cantidad) || 0),
    0,
  );
  const hayAgotados = carrito.some((item) => Number(item.stock) <= 0);

  useEffect(() => {
    if (isOpen) window.history.pushState({ cartOpen: true }, "");
    const handler = () => {
      if (isOpen) onClose();
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isOpen, onClose]);

  const actualizarCantidad = (id: string | number, delta: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.id !== id) return item;
        const stock = Number(item.stock) || 0;
        const actual = Number(item.cantidad) || 1;
        if (delta > 0 && actual >= stock) return item;
        return { ...item, cantidad: Math.max(1, actual + delta) };
      }),
    );
  };

  const eliminarItem = (id: string | number) => {
    setItemEliminando(id);
    setTimeout(() => {
      setCarrito(carrito.filter((item) => item.id !== id));
      setItemEliminando(null);
    }, 300);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="carrito-root">
            {/* ── BACKDROP MUY SUAVE — se ve la tienda detrás ── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90]"
              style={{
                background: "rgba(255, 248, 240, 0.4)",
                backdropFilter: "blur(12px) saturate(1.4)",
                WebkitBackdropFilter: "blur(12px) saturate(1.4)",
              }}
              onClick={() => {
                window.history.back();
                onClose();
              }}
            />

            {/* ── SHEET — sube desde abajo, NO ocupa toda la pantalla ── */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col"
              style={{
                maxHeight: "88vh",
                borderRadius: "2.5rem 2.5rem 0 0",
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(24px) saturate(1.8)",
                WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                boxShadow:
                  "0 -8px 40px rgba(249,115,22,0.12), 0 -1px 0 rgba(249,115,22,0.15)",
                border: "1px solid rgba(255,255,255,0.9)",
                borderBottom: "none",
              }}
            >
              {/* ── PILL HANDLE ── */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.12)" }}
                />
              </div>

              {/* ═══════════════════════════════
                  HEADER
              ═══════════════════════════════ */}
              <div
                className="px-6 pt-3 pb-4 flex items-center justify-between flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(249,115,22,0.1)" }}
              >
                <div className="flex items-center gap-3">
                  {/* Ícono carrito con badge */}
                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(249,115,22,0.1)" }}
                    >
                      <svg
                        className="w-5 h-5 text-[#F97316]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </div>
                    {cantidadTotal > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center"
                      >
                        <span className="text-[9px] font-black text-white">
                          {cantidadTotal}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-[18px] font-[900] text-[#1A1A1A] uppercase tracking-tight leading-none">
                      Mi carrito
                    </h2>
                    <p className="text-[10px] font-bold text-[#A09890] uppercase tracking-wider mt-0.5">
                      {carrito.length}{" "}
                      {carrito.length === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {carrito.length > 0 && (
                    <button
                      onClick={() => setCarrito([])}
                      className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        color: "#EF4444",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      Vaciar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.history.back();
                      onClose();
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[#6B6560]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
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

              {/* ═══════════════════════════════
                  LISTA
              ═══════════════════════════════ */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0"
                style={{ scrollbarWidth: "none" }}
              >
                {carrito.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: "rgba(249,115,22,0.08)" }}
                    >
                      🛒
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#C4BFB6] text-center">
                      Tu carrito está vacío
                    </p>
                  </motion.div>
                ) : (
                  carrito.map((item, index) => {
                    const agotado = Number(item.stock) <= 0;
                    const saliendo = itemEliminando === item.id;
                    const subtotal =
                      Number(item.precio) * Number(item.cantidad);

                    return (
                      <motion.div
                        layout
                        key={`item-${item.id}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{
                          opacity: saliendo ? 0 : 1,
                          y: saliendo ? -8 : 0,
                          scale: saliendo ? 0.96 : 1,
                        }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className="flex gap-3 p-3.5 rounded-[1.4rem]"
                        style={{
                          background: agotado
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.8)",
                          border: agotado
                            ? "1px solid rgba(0,0,0,0.06)"
                            : "1px solid rgba(249,115,22,0.12)",
                          boxShadow: agotado
                            ? "none"
                            : "0 2px 12px rgba(249,115,22,0.06)",
                        }}
                      >
                        {/* Imagen */}
                        <div
                          className="w-[68px] h-[68px] rounded-[1rem] flex-shrink-0 flex items-center justify-center p-2 overflow-hidden"
                          style={{
                            background: agotado
                              ? "rgba(0,0,0,0.04)"
                              : "rgba(249,115,22,0.06)",
                          }}
                        >
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className={`w-full h-full object-contain ${agotado ? "grayscale opacity-40" : ""}`}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-tight text-[#6B6560] truncate leading-none mb-1">
                            {item.nombre}
                          </p>

                          {agotado ? (
                            <p className="text-[12px] font-black text-red-500 uppercase">
                              ⚠️ Agotado
                            </p>
                          ) : (
                            <motion.p
                              key={subtotal}
                              initial={{ scale: 1.08 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 10 }}
                              className="text-[20px] font-[900] text-[#1A1A1A] leading-none tracking-tighter"
                            >
                              {subtotal.toFixed(2)}
                              <span className="text-[11px] text-[#F97316] ml-0.5 font-black">
                                Bs
                              </span>
                            </motion.p>
                          )}

                          <p className="text-[9px] text-[#C4BFB6] font-semibold mt-0.5">
                            {Number(item.precio).toFixed(2)} Bs c/u
                          </p>

                          {/* Controles inline */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div
                              className="flex items-center rounded-xl overflow-hidden"
                              style={{
                                background: "rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.07)",
                              }}
                            >
                              <button
                                onClick={() => actualizarCantidad(item.id, -1)}
                                disabled={agotado}
                                className="w-7 h-7 text-[#6B6560] font-black text-base flex items-center justify-center hover:bg-black/5 active:scale-75 transition-all disabled:opacity-20"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-[12px] font-black text-[#F97316]">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => actualizarCantidad(item.id, 1)}
                                disabled={
                                  agotado || item.cantidad >= (item.stock || 0)
                                }
                                className="w-7 h-7 text-[#6B6560] font-black text-base flex items-center justify-center hover:bg-black/5 active:scale-75 transition-all disabled:opacity-20"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => eliminarItem(item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                              style={{ background: "rgba(239,68,68,0.07)" }}
                            >
                              <svg
                                className="w-3 h-3 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
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
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* ═══════════════════════════════
                  FOOTER
              ═══════════════════════════════ */}
              {carrito.length > 0 && (
                <div
                  className="flex-shrink-0 px-5 pt-3 pb-8"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                  {/* Resumen compacto */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    {/* Ubicación */}
                    <button
                      onClick={vincularGps}
                      disabled={loadingGps}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                        loadingGps ? "animate-pulse" : ""
                      }`}
                      style={
                        loadingGps
                          ? {
                              background: "rgba(249,115,22,0.1)",
                              color: "#F97316",
                            }
                          : ubicacion
                            ? {
                                background: "rgba(16,185,129,0.1)",
                                color: "#059669",
                                border: "1px solid rgba(16,185,129,0.2)",
                              }
                            : {
                                background: "#F97316",
                                color: "white",
                                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                              }
                      }
                    >
                      {loadingGps ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                          Buscando...
                        </>
                      ) : ubicacion ? (
                        <>📍 {regionNombre || "Detectado"} ✓</>
                      ) : (
                        <>📍 ¿Dónde enviamos?</>
                      )}
                    </button>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-[#A09890] tracking-wider leading-none mb-0.5">
                        Total
                      </p>
                      <motion.p
                        key={total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="text-[26px] font-[900] text-[#1A1A1A] leading-none tracking-tighter"
                      >
                        {total.toFixed(2)}
                        <span className="text-[13px] text-[#F97316] ml-0.5 font-black">
                          Bs
                        </span>
                      </motion.p>
                    </div>
                  </div>

                  {/* Alerta agotados */}
                  <AnimatePresence>
                    {hayAgotados && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 px-4 py-3 rounded-2xl flex items-center gap-2"
                        style={{
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                        }}
                      >
                        <span className="text-sm">⚠️</span>
                        <p className="text-[10px] font-black uppercase text-red-500 leading-snug">
                          Elimina los productos agotados para continuar
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón pagar */}
                  <button
                    disabled={!ubicacion || loadingGps || hayAgotados}
                    onClick={() => setMostrandoPago(true)}
                    className="relative w-full h-[62px] rounded-[1.3rem] overflow-hidden flex items-center justify-between px-5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={
                      !ubicacion || loadingGps || hayAgotados
                        ? {
                            background: "rgba(0,0,0,0.06)",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)",
                            boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
                          }
                    }
                  >
                    {/* Shimmer */}
                    {ubicacion && !loadingGps && !hayAgotados && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(249,115,22,0.12), transparent)",
                        }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    <div className="relative z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-0.5">
                        {!ubicacion ? "Agrega tu dirección" : "Todo listo"}
                      </p>
                      <p className="text-[17px] font-[900] text-white uppercase tracking-tight leading-none">
                        {!ubicacion || loadingGps || hayAgotados
                          ? "No disponible"
                          : "Pagar ahora"}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-[15px] font-[900] text-[#F97316]">
                        {total.toFixed(2)} Bs
                      </span>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(249,115,22,0.2)" }}
                      >
                        <svg
                          className="w-4 h-4 text-[#F97316]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Trust line */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {[
                      "🔒 Pago seguro",
                      "📦 Envío garantizado",
                      "✅ Verificado",
                    ].map((t) => (
                      <span
                        key={t}
                        className="text-[8px] font-black uppercase tracking-wider text-[#C4BFB6]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulador de pago */}
      <AnimatePresence>
        {mostrandoPago && (
          <SimuladorPago
            total={total}
            cantidad={cantidadTotal}
            onClose={() => setMostrandoPago(false)}
            regionNombre={regionNombre}
            productoNombre={
              carrito.length === 1
                ? carrito[0].nombre
                : `${carrito.length} productos`
            }
            ubicacionGps={ubicacion}
            precioUnitario={total / Math.max(cantidadTotal, 1)}
            carrito={carrito}
            onPedidoConfirmado={() => {
              setCarrito([]);
              setMostrandoPago(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
