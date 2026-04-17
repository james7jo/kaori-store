"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ⭐ Rating - AHORA EN NARANJA
function StarRating({ stock }: { stock: number }) {
  // LÓGICA DE KAORI STORE:
  // 1. Calculamos ventas (Stock Inicial 20 - Stock Actual)
  const ventas = 20 - stock;

  // 2. Calculamos estrellas (1 por cada 5 ventas)
  const estrellasCalculadas = Math.floor(ventas / 5);

  // 3. El score final (Mínimo 1 para que no sea triste, Máximo 5)
  const scoreFinal = Math.min(Math.max(estrellasCalculadas, 1), 5);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-[10px] ${
              i <= scoreFinal ? "text-[#F97316]" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {/* Opcional: un mini texto que diga los vendidos para que el cliente entienda */}
      <p className="text-[8px] font-black text-gray-400 italic uppercase">
        {ventas > 0 ? `${ventas} vendidos` : "Nuevo"}
      </p>
    </div>
  );
}

export default function TarjetaProducto({ producto, onClick }: any) {
  const [loaded, setLoaded] = useState(false);
  const [indexImagen, setIndexImagen] = useState(0); // Para controlar qué foto se ve

  // 1. Creamos el array de todas las fotos disponibles
  const todasLasFotos = [
    producto.imagen,
    ...(producto.galeria
      ? producto.galeria.split(",").filter((img: string) => img !== "")
      : []),
  ];

  // 2. Efecto para rotar las imágenes automáticamente cada 3 segundos
  useEffect(() => {
    // Solo rotamos si hay más de una foto y el producto NO está agotado
    if (todasLasFotos.length <= 1 || Number(producto.stock) <= 0) return;

    const intervalo = setInterval(() => {
      setIndexImagen((prev) => (prev + 1) % todasLasFotos.length);
    }, 3000); // 3 segundos por foto

    return () => clearInterval(intervalo);
  }, [todasLasFotos.length, producto.stock]);

  // ... resto de tus constantes (consultas, vendidos, etc)
  const [consultas, setConsultas] = useState(producto.consultas || 0);

  const vendidosCalculados = Math.max(
    0,
    (producto.stockInicial || 0) - (producto.stock || 0),
  );

  const rating = Math.max(
    1,
    Math.min(5, Math.floor(vendidosCalculados / 5) + 1),
  );

  const tieneDescuento = producto.descuento && producto.descuento !== "";

  useEffect(() => {
    const saved = localStorage.getItem(`consultas_${producto.id}`);
    if (saved) {
      setConsultas(parseInt(saved));
    }
  }, [producto.id]);

  const handleClick = () => {
    const nuevas = consultas + 1;
    setConsultas(nuevas);
    localStorage.setItem(`consultas_${producto.id}`, nuevas.toString());
    onClick();
  };

  // 🧠 BADGE INTELIGENTE - COLORES SINCRONIZADOS
  const getBadge = () => {
    if (tieneDescuento) {
      return {
        text: `-${producto.descuento}`,
        style: "bg-red-500/10 border-red-500/20 text-red-500",
      };
    }

    if (vendidosCalculados > 20) {
      return {
        text: "🔥 Top ventas",
        style: "bg-[#F97316]/10 border-[#F97316]/20 text-[#F97316]",
      };
    }

    if (vendidosCalculados < 3) {
      return {
        text: "Recien añadido",
        style: "bg-orange-400/10 border-orange-400/20 text-orange-500",
      };
    }

    if (producto.stock > 0 && producto.stock <= 5) {
      return {
        text: "⏳ Últimas",
        style: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      };
    }

    return {
      text: "🚚 Envío Nacional",
      style: "bg-gray-100 border-gray-200 text-gray-500",
    };
  };

  const badge = getBadge();

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -4 }}
      // FONDO BLANCO Y BORDE NARANJA SUAVE
      className="relative bg-white rounded-2xl overflow-hidden group cursor-pointer border border-[#F97316]/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
    >
      {/* Glow Naranja al pasar el mouse */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#F97316]/5 via-transparent to-transparent pointer-events-none" />

      {/* IMAGEN - FONDO CREMA SUAVE */}
      {/* IMAGEN - CARRUSEL AUTOMÁTICO */}
      <div className="aspect-square relative bg-[#FFF8F1]/30 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={todasLasFotos[indexImagen]}
            src={todasLasFotos[indexImagen]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full object-contain p-3 transition-all ${
              Number(producto.stock) <= 0
                ? "grayscale opacity-25 brightness-90"
                : "group-hover:scale-110 duration-700"
            }`}
            alt={producto.nombre}
          />
        </AnimatePresence>

        {/* PUNTITOS INDICADORES */}
        {todasLasFotos.length > 1 && Number(producto.stock) > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-20">
            {todasLasFotos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === indexImagen ? "bg-[#F97316] w-3" : "bg-gray-400/30 w-1"
                }`}
              />
            ))}
          </div>
        )}

        {/* 🔻 DESCUENTO */}
        {tieneDescuento && (
          <div className="absolute top-2 left-2 bg-[#EA580C] px-2 py-1 rounded-md shadow-md z-10">
            <span className="text-[10px] font-bold text-white">
              -{producto.descuento}
            </span>
          </div>
        )}

        {/* ⚠️ POCAS UNIDADES */}
        {Number(producto.stock) > 0 && Number(producto.stock) <= 5 && (
          <div className="absolute bottom-2 left-2 bg-amber-500 px-2 py-1 rounded-md shadow-md animate-pulse z-10">
            <span className="text-[10px] font-black text-white uppercase">
              {Number(producto.stock) === 1
                ? "Última unidad"
                : `Quedan ${producto.stock}`}
            </span>
          </div>
        )}

        {/* 🚫 CARTEL DE AGOTADO */}
        {Number(producto.stock) <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-[#1F2937]/90 px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 -rotate-12 backdrop-blur-sm">
              <span className="text-[9px] font-black text-white uppercase italic tracking-widest">
                Agotado
              </span>
            </div>
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="p-3 flex flex-col gap-2">
        {/* NOMBRE EN GRIS PIZARRA */}
        <h3 className="text-[13px] text-[#1F2937] font-bold uppercase line-clamp-2 h-[34px] group-hover:text-[#F97316] transition">
          {producto.nombre}
        </h3>

        {/* PRECIO + BADGE */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {tieneDescuento && (
              <span className="text-[10px] text-gray-400 line-through">
                Bs{" "}
                {(() => {
                  const precio = Number(producto.precio) || 0;
                  const desc = producto.descuento.toString();

                  if (desc.includes("%")) {
                    // Si pusiste "10%", calculamos el valor real para tacharlo
                    const porcentaje = parseFloat(desc) / 100;
                    return (precio / (1 - porcentaje)).toFixed(0);
                  }
                  // Si pusiste solo "10", sumamos directo
                  return precio + (Number(desc) || 0);
                })()}
              </span>
            )}

            <div className="flex items-end gap-1">
              <span className="text-[#F97316] text-xs font-bold uppercase">
                Bs
              </span>
              <span>{Number(producto.precio).toFixed(2)}</span>
            </div>
          </div>

          {/* Badge Dinámico */}
          <div className={`px-2 py-[2px] rounded-md border ${badge.style}`}>
            <span className="text-[8px] font-bold uppercase">{badge.text}</span>
          </div>
        </div>

        {/* RATING + DATOS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-[2px] rounded-md border border-gray-100">
            <StarRating stock={rating} />
            <span className="text-[10px] text-gray-500 font-bold">
              {rating}.0
            </span>
          </div>

          {/* CONSULTAS + VENDIDOS */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
            <span className="group-hover:text-[#F97316] transition">
              💬 {consultas}
            </span>
            <span>•</span>
            <span
              className={`text-[10px] uppercase italic tracking-tighter ${
                producto.vendidos > 0
                  ? "text-[#F97316] font-[1000] drop-shadow-[0_0_5px_rgba(249,115,22,0.2)]"
                  : "text-gray-400 font-bold"
              }`}
            >
              🛒 {producto.vendidos > 0 ? `${producto.vendidos}` : "Nuevo"}
            </span>
          </div>
        </div>
      </div>

      {/* BORDE DE ENFOQUE AL HOVER */}
      <div className="absolute inset-0 rounded-2xl border-2 border-[#F97316]/0 group-hover:border-[#F97316]/10 transition pointer-events-none" />
    </motion.div>
  );
}
