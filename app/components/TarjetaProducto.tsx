"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// ⭐ Rating
function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-[10px] ${
            i <= score ? "text-orange-400" : "text-gray-700"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TarjetaProducto({ producto, onClick }: any) {
  const [loaded, setLoaded] = useState(false);
  const [consultas, setConsultas] = useState(producto.consultas || 0);

  // ⭐ rating por ventas (cada 5 ventas)
  const vendidosCalculados = Math.max(
    0,
    (producto.stockInicial || 0) - (producto.stock || 0),
  );

  const rating = Math.max(
    1,
    Math.min(5, Math.floor(vendidosCalculados / 5) + 1),
  );

  const tieneDescuento = producto.descuento && producto.descuento !== "";

  // 🔥 CARGAR consultas guardadas
  useEffect(() => {
    const saved = localStorage.getItem(`consultas_${producto.id}`);
    if (saved) {
      setConsultas(parseInt(saved));
    }
  }, [producto.id]);

  // 🔥 SUMAR CONSULTA (click)
  const handleClick = () => {
    const nuevas = consultas + 1;
    setConsultas(nuevas);
    localStorage.setItem(`consultas_${producto.id}`, nuevas.toString());
    onClick();
  };

  // 🧠 BADGE INTELIGENTE
  const getBadge = () => {
    if (tieneDescuento) {
      return {
        text: `-${producto.descuento}`,
        style: "bg-red-500/10 border-red-500/30 text-red-400",
      };
    }

    if (vendidosCalculados > 20) {
      return {
        text: "🔥 Top ventas",
        style: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      };
    }

    if (vendidosCalculados < 3) {
      return {
        text: "🆕 Nuevo",
        style: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      };
    }

    if (producto.stock > 0 && producto.stock <= 5) {
      return {
        text: "⏳ Últimas",
        style: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      };
    }

    return {
      text: "🚚 Envío Nacional",
      style: "bg-white/5 border-white/10 text-gray-400",
    };
  };

  const badge = getBadge();

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="relative bg-[#0e0e0e] rounded-2xl overflow-hidden group cursor-pointer border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />

      {/* IMAGEN */}
      <div className="aspect-square relative bg-[#080808] overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#1a1a1a] to-[#111]" />
        )}

        <img
          src={producto.imagen}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-contain p-3 transition duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-110 blur-sm"
          } group-hover:scale-110`}
          alt={producto.nombre}
        />

        {/* 🔻 DESCUENTO */}
        {tieneDescuento && (
          <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-md">
            <span className="text-[10px] font-bold text-white">
              -{producto.descuento}
            </span>
          </div>
        )}

        {/* ⚠️ POCAS UNIDADES */}
        {producto.stock > 0 && producto.stock <= 5 && (
          <div className="absolute bottom-2 left-2 bg-yellow-500/90 px-2 py-1 rounded-md shadow-md animate-pulse">
            <span className="text-[10px] font-bold text-black uppercase">
              {producto.stock === 1
                ? "🔥 Última unidad"
                : `⚠️ Quedan ${producto.stock}`}
            </span>
          </div>
        )}

        {/* 🚫 AGOTADO */}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-xs font-black text-white bg-red-600 px-3 py-1 rounded-md">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-[13px] text-gray-100 font-bold uppercase line-clamp-2 h-[34px] group-hover:text-orange-400 transition">
          {producto.nombre}
        </h3>

        {/* PRECIO + BADGE */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {tieneDescuento && (
              <span className="text-[10px] text-gray-500 line-through">
                Bs {producto.precio + 10}
              </span>
            )}

            <div className="flex items-end gap-1">
              <span className="text-orange-500 text-xs font-bold">Bs</span>
              <span className="text-2xl font-bold text-white">
                {producto.precio}
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className={`px-2 py-[2px] rounded-md border ${badge.style}`}>
            <span className="text-[8px] font-bold uppercase">{badge.text}</span>
          </div>
        </div>

        {/* RATING + DATOS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/5 px-2 py-[2px] rounded-md">
            <StarRating score={rating} />
            <span className="text-[10px] text-gray-400">{rating}.0</span>
          </div>

          {/* CONSULTAS + VENDIDOS */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>💬 {consultas}</span>
            <span>•</span>
            <span>🛒 {vendidosCalculados}</span>
          </div>
        </div>
      </div>

      {/* BORDE */}
      <div className="absolute inset-0 rounded-2xl border border-orange-500/0 group-hover:border-orange-500/20 transition pointer-events-none" />
    </motion.div>
  );
}
