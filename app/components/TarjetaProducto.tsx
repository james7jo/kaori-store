"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Función para saber si un producto se subió hace menos de 24 horas
const esProductoNuevo = (fechaIso: string) => {
  if (!fechaIso) return false;
  const fechaCreacion = new Date(fechaIso).getTime();
  const ahora = new Date().getTime();
  const unDiaEnMilisegundos = 24 * 60 * 60 * 1000; // 24 horas
  return ahora - fechaCreacion < unDiaEnMilisegundos;
};

// ⭐ Rating - AHORA EN NARANJA
// ⭐ Rating - AHORA INDEPENDIENTE POR PRODUCTO
function StarRating({ producto }: { producto: any }) {
  // 1. Usamos los valores reales que vienen de Supabase/Base de datos para ESTE producto
  // Si no existen, usamos 0 para no romper el código
  const stockActual = Number(producto.stock) || 0;
  const vendidosReal = Number(producto.vendidos) || 0;

  // 2. Calculamos las estrellas (1 por cada 5 ventas del producto específico)
  // Sumamos 1 de base para que no se vea vacío
  const estrellasCalculadas = Math.floor(vendidosReal / 5) + 1;

  // 3. El score final (Máximo 5)
  const scoreFinal = Math.min(estrellasCalculadas, 5);

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

      {/* Muestra los vendidos reales de este producto específico */}
      <p className="text-[8px] font-black text-gray-400 italic uppercase">
        {vendidosReal > 0 ? `${vendidosReal} vendidos` : "Nuevo"}
      </p>
      <p className="text-[8px] font-black text-gray-400 italic uppercase">
        {vendidosReal > 0
          ? `${vendidosReal} vendidos`
          : esProductoNuevo(producto.created_at)
            ? "Nuevo"
            : ""}
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

    if (vendidosCalculados < 3 && esProductoNuevo(producto.created_at)) {
      return {
        text: "Recién añadido",
        style: "bg-orange-400/10 border-orange-400/20 text-orange-600",
      };
    }

    if (vendidosCalculados < 3) {
      return {
        text: "Recién añadido",
        style: "bg-orange-400/10 border-orange-400/20 text-orange-600",
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

      {/* IMAGEN - CARRUSEL AUTOMÁTICO */}
      <div className="aspect-square relative bg-[#FFF8F1]/30 overflow-hidden">
        <img
          src={producto.imagen}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-contain p-3 transition-all duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0"
          } ${
            Number(producto.stock) <= 0
              ? "grayscale opacity-30 brightness-90"
              : "group-hover:scale-110"
          }`}
          alt={producto.nombre}
        />

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
        {/* NOMBRE DEL PRODUCTO - Altura fija para alinear todo */}
        <h3 className="text-[13px] text-[#1F2937] font-[1000] uppercase line-clamp-2 min-h-[34px] group-hover:text-[#F97316] transition-colors leading-tight">
          {producto.nombre}
        </h3>

        {/* CONTENEDOR PRECIO + BADGE - Alineado al fondo con altura constante */}
        <div className="flex items-end justify-between min-h-[40px] mt-1">
          <div className="flex flex-col justify-end">
            {tieneDescuento && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-1">
                Bs{" "}
                {(() => {
                  const precioActual = Number(producto.precio) || 0;
                  const valorPorcentaje = parseFloat(
                    producto.descuento.toString().replace("%", ""),
                  );
                  if (isNaN(valorPorcentaje) || valorPorcentaje >= 100)
                    return precioActual;
                  const factor = (100 - valorPorcentaje) / 100;
                  return (precioActual / factor).toFixed(0);
                })()}
              </span>
            )}

            <div className="flex items-end gap-1 leading-none">
              <span className="text-[#F97316] text-xs font-bold uppercase">
                Bs
              </span>
              <span className="text-[17px] font-[1000] text-[#1F2937]">
                {Number(producto.precio).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Badge Dinámico en dos pisos (Recién / Añadido) */}
          {/* Solo mostramos el cuadradito si tiene texto (como el Recién Añadido) */}
          {badge.text && badge.text !== "🚚 Envío Nacional" && (
            <div
              className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 ${badge.style}`}
            >
              <span className="text-[8px] font-[1000] uppercase tracking-tighter leading-[1.1] text-center max-w-[45px]">
                {badge.text}
              </span>
            </div>
          )}
        </div>

        {/* RATING + DATOS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-[2px] rounded-md border border-gray-100">
            <StarRating producto={producto} />
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
