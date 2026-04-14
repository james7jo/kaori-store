"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  producto: any;
  onClose: () => void;
  onAgregar: (p: any) => void;
}

export default function ModalDetalle({ producto, onClose, onAgregar }: Props) {
  const fotos = producto.galeria
    ? [producto.imagen, ...producto.galeria.split(",").filter(Boolean)]
    : [producto.imagen];
  const [indexFoto, setIndexFoto] = useState(0);

  const ahorro =
    producto.precio_original && producto.precio
      ? Number(producto.precio_original) - Number(producto.precio)
      : null;

  const rating = Math.min(5, Math.round((producto.vendidos || 0) / 60));

  const consultarWhatsApp = () => {
    const text = `¡Hola Kaori Store! 👋 Tengo una consulta sobre: *${producto.nombre}*.`;
    window.open(`https://wa.me/59174244882?text=${encodeURIComponent(text)}`);
  };

  const comprarAhora = () => {
    const text = `¡Hola! Quiero comprar: *${producto.nombre}* — Bs ${producto.precio} 🛒`;
    window.open(`https://wa.me/59174244882?text=${encodeURIComponent(text)}`);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#080808] z-50 flex flex-col overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#080808]">
        <button
          onClick={onClose}
          className="w-[34px] h-[34px] bg-white/[0.05] border border-white/[0.08] rounded-[12px] flex items-center justify-center active:scale-90 transition"
        >
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <p className="text-orange-500 font-black animate-pulse italic tracking-[0.3em] uppercase">
            KAORI STORE
          </p>
          <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">
            Detalle de producto
          </span>
        </div>
        <button
          onClick={consultarWhatsApp}
          className="text-[9px] font-black text-gray-500 uppercase tracking-[0.5px] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 rounded-[10px]"
        >
          Ayuda
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* IMAGEN — tamaño contenido, no pantalla completa */}
        <div
          className="relative w-full bg-[#060606] flex items-center justify-center overflow-hidden"
          style={{ height: 220 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={indexFoto}
              src={fotos[indexFoto]}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full object-contain p-4"
              alt={producto.nombre}
            />
          </AnimatePresence>

          {producto.descuento && (
            <div className="absolute top-2.5 left-2.5 bg-red-600 px-2.5 py-1 rounded-[8px]">
              <span className="text-[10px] font-black italic text-white">
                -{producto.descuento}
              </span>
            </div>
          )}

          <button className="absolute top-2.5 right-2.5 w-[32px] h-[32px] bg-white/[0.06] border border-white/[0.1] rounded-[10px] flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {fotos.length > 1 && (
            <>
              <div className="absolute bottom-2 flex gap-1 left-1/2 -translate-x-1/2">
                {fotos.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setIndexFoto(i)}
                    className={`h-1 rounded-full transition-all cursor-pointer ${
                      i === indexFoto
                        ? "w-4 bg-orange-500"
                        : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex">
                <div
                  className="flex-1"
                  onClick={() =>
                    setIndexFoto(
                      indexFoto > 0 ? indexFoto - 1 : fotos.length - 1,
                    )
                  }
                />
                <div
                  className="flex-1"
                  onClick={() =>
                    setIndexFoto(
                      indexFoto < fotos.length - 1 ? indexFoto + 1 : 0,
                    )
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Precio + nombre */}
          <div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-[13px] font-black italic text-orange-500">
                Bs
              </span>
              <span className="text-[32px] font-black italic tracking-[-1.5px] text-white leading-none">
                {producto.precio}
              </span>
              {producto.precio_original && (
                <span className="text-[12px] text-gray-600 line-through ml-1">
                  {producto.precio_original}
                </span>
              )}
              {ahorro && ahorro > 0 && (
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[6px] ml-1">
                  Ahorrás Bs {ahorro}
                </span>
              )}
            </div>
            <p className="text-[14px] font-black italic uppercase text-gray-100 leading-tight tracking-[0.3px] mt-1.5">
              {producto.nombre}
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-wide text-emerald-400">
              En stock
            </span>
            <span className="text-[10px] text-gray-600">
              · {producto.stock} unidades
            </span>
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Stats en 3 chips */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: producto.vendidos ?? 0, lbl: "Vendidos" },
              {
                val: `${rating}.0 / 5`,
                lbl: "Rating",
                stars: true,
                ratingVal: rating,
              },
              { val: producto.consultas ?? 0, lbl: "Consultas" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.05] rounded-[12px] p-2 flex flex-col items-center gap-1"
              >
                {s.stars ? (
                  <>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`text-[9px] ${n <= s.ratingVal! ? "text-amber-400" : "text-gray-800"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-gray-100">
                      {s.val}
                    </span>
                  </>
                ) : (
                  <span className="text-[13px] font-black text-gray-100">
                    {s.val}
                  </span>
                )}
                <span className="text-[8px] text-gray-600 uppercase tracking-[0.4px]">
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Descripción compacta */}
          {producto.descripcion && (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[14px] p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.8px] text-gray-600 mb-1.5">
                Descripción
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed italic">
                "{producto.descripcion}"
              </p>
            </div>
          )}

          {/* Logística */}
          <div className="flex flex-col gap-2">
            <p className="text-[8px] font-black uppercase tracking-[0.8px] text-gray-600">
              Logística Kaori
            </p>
            {[
              {
                color: "blue",
                label: "Cochabamba",
                sub: "Entrega gratuita el mismo día",
              },
              {
                color: "orange",
                label: "Villazón / La Paz",
                sub: "Envío sin costo a terminal",
              },
            ].map((l) => (
              <div
                key={l.label}
                className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.05] rounded-[12px] p-2.5"
              >
                <div
                  className={`w-[28px] h-[28px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${l.color === "blue" ? "bg-blue-500/10" : "bg-orange-500/10"}`}
                >
                  <svg
                    className={`w-3 h-3 ${l.color === "blue" ? "text-blue-400" : "text-orange-400"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    {l.color === "blue" ? (
                      <>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </>
                    ) : (
                      <>
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </>
                    )}
                  </svg>
                </div>
                <div>
                  <p
                    className={`text-[10px] font-black uppercase font-style-italic tracking-[0.3px] ${l.color === "blue" ? "text-blue-400" : "text-orange-400"}`}
                  >
                    {l.label}
                  </p>
                  <p className="text-[9px] text-gray-600">{l.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* FOOTER — proporcional y compacto */}
      <div className="bg-[#0c0c0c] border-t border-white/[0.06] px-4 py-3 flex flex-col gap-2.5">
        <div className="flex gap-2">
          <button
            onClick={() => onAgregar(producto)}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-[14px] py-[11px] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.5px] text-gray-300">
              Agregar al carrito
            </span>
          </button>

          <button
            onClick={consultarWhatsApp}
            className="w-[44px] h-[44px] bg-emerald-600/[0.12] border border-emerald-600/[0.2] rounded-[14px] flex items-center justify-center active:scale-95 transition flex-shrink-0"
            title="Consultar por WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>

        <button
          onClick={comprarAhora}
          className="w-full bg-orange-600 rounded-[14px] py-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-[13px] font-black italic uppercase tracking-[0.5px] text-white">
            Comprar ahora
          </span>
        </button>
      </div>
    </motion.div>
  );
}
