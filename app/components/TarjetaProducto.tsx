"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface Producto {
  id: string | number;
  nombre: string;
  precio: number | string;
  descuento?: string | null;
  stock: number | string;
  stockInicial?: number | string;
  vendidos?: number | string;
  imagen: string;
  galeria?: string;
  created_at?: string;
  consultas?: number;
}

interface TarjetaProductoProps {
  producto: Producto;
  onClick: () => void;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const esProductoNuevo = (fechaIso?: string): boolean => {
  if (!fechaIso) return false;
  const creacion = new Date(fechaIso).getTime();
  const ahora = Date.now();
  return ahora - creacion < 24 * 60 * 60 * 1000;
};

const calcularVendidos = (producto: Producto): number => {
  // Prioridad 1: campo "vendidos" real de la base de datos
  const vendidosDB = Number(producto.vendidos);
  if (!isNaN(vendidosDB) && vendidosDB > 0) return vendidosDB;

  // Prioridad 2: diferencia stockInicial - stockActual
  const inicial = Number(producto.stockInicial);
  const actual = Number(producto.stock);
  if (!isNaN(inicial) && !isNaN(actual)) return Math.max(0, inicial - actual);

  return 0;
};

const calcularStars = (vendidos: number): number =>
  Math.min(5, Math.max(1, Math.floor(vendidos / 5) + 1));

const calcularPctStock = (stock: number, stockInicial: number): number => {
  if (!stockInicial) return 100;
  return Math.round((stock / stockInicial) * 100);
};

// ─────────────────────────────────────────────
// BADGE DINÁMICO — nunca muestra algo fijo
// Prioridad: descuento > nuevo > top ventas > pocas unidades > envío gratis
// ─────────────────────────────────────────────
type BadgeStyle = { text: string; className: string };

const getDynamicBadge = (producto: Producto, vendidos: number): BadgeStyle => {
  const stock = Number(producto.stock);

  if (producto.descuento && producto.descuento !== "") {
    return {
      text: `-${producto.descuento}`,
      className: "bg-red-50 border-red-200 text-red-700",
    };
  }

  if (esProductoNuevo(producto.created_at) && vendidos < 5) {
    return {
      text: "Recién llegado",
      className: "bg-blue-50 border-blue-200 text-blue-700",
    };
  }

  if (vendidos >= 20) {
    return {
      text: "Top ventas",
      className: "bg-orange-50 border-orange-200 text-orange-700",
    };
  }

  if (stock > 0 && stock <= 5) {
    return {
      text: "Últimas",
      className: "bg-amber-50 border-amber-200 text-amber-700",
    };
  }

  return {
    text: "Disponible",
    className: "bg-green-50 border-green-200 text-green-700",
  };
};

// Badge pequeño en la esquina de la imagen (solo si aplica)
const getImageBadge = (
  producto: Producto,
): { text: string; className: string } | null => {
  if (producto.descuento && producto.descuento !== "") {
    return {
      text: `-${producto.descuento}`,
      className: "bg-[#EA580C] text-white",
    };
  }
  if (esProductoNuevo(producto.created_at)) {
    return { text: "Nuevo", className: "bg-blue-600 text-white" };
  }
  return null;
};

// ─────────────────────────────────────────────
// SUBCOMPONENTE: Estrellas
// ─────────────────────────────────────────────
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-[11px] leading-none ${
            i <= stars ? "text-[#F97316]" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SUBCOMPONENTE: Barra de Stock
// Reemplaza el espacio vacío con info útil y visual
// ─────────────────────────────────────────────
function StockBar({
  stock,
  stockInicial,
  vendidos,
}: {
  stock: number;
  stockInicial: number;
  vendidos: number;
}) {
  const pct = calcularPctStock(stock, stockInicial);

  // Color de la barra según stock restante
  const barColor =
    pct > 50 ? "bg-emerald-400" : pct > 20 ? "bg-amber-400" : "bg-red-400";

  if (stock <= 0) {
    return (
      <p className="text-[10px] font-medium text-gray-400 italic">
        {vendidos > 0 ? `${vendidos} vendidos` : "Sin stock"}
      </p>
    );
  }

  if (!stockInicial) {
    // Sin stockInicial, mostramos solo vendidos
    return (
      <p className="text-[10px] font-medium text-gray-400">
        {vendidos > 0 ? `${vendidos} vendidos` : "Comprar"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[3px] w-[80px]">
      <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
        Stock {pct}%
      </p>
      <div className="h-[3px] w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function TarjetaProducto({
  producto,
  onClick,
}: TarjetaProductoProps) {
  const [loaded, setLoaded] = useState(false);
  const [indexImagen, setIndexImagen] = useState(0);
  const [consultas, setConsultas] = useState(producto.consultas || 0);

  // Array de todas las fotos disponibles
  const todasLasFotos: string[] = [
    producto.imagen,
    ...(producto.galeria
      ? producto.galeria
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []),
  ];

  const stockActual = Number(producto.stock) || 0;
  const stockInicial = Number(producto.stockInicial) || 0;
  const vendidos = calcularVendidos(producto);
  const stars = calcularStars(vendidos);
  const tieneDescuento = !!producto.descuento && producto.descuento !== "";
  const isAgotado = stockActual <= 0;
  const isPocas = stockActual > 0 && stockActual <= 5;

  const dynamicBadge = getDynamicBadge(producto, vendidos);
  const imageBadge = getImageBadge(producto);

  // Carrusel automático — solo si hay más de una foto y hay stock
  useEffect(() => {
    if (todasLasFotos.length <= 1 || isAgotado) return;
    const intervalo = setInterval(() => {
      setIndexImagen((prev) => (prev + 1) % todasLasFotos.length);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [todasLasFotos.length, isAgotado]);

  // Leer consultas guardadas en localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`consultas_${producto.id}`);
    if (saved) setConsultas(parseInt(saved, 10));
  }, [producto.id]);

  const handleClick = useCallback(() => {
    const nuevas = consultas + 1;
    setConsultas(nuevas);
    localStorage.setItem(`consultas_${producto.id}`, nuevas.toString());
    onClick();
  }, [consultas, producto.id, onClick]);

  // Precio original (antes del descuento)
  const precioActual = Number(producto.precio) || 0;
  const precioOriginal = tieneDescuento
    ? (() => {
        const pct = parseFloat(
          (producto.descuento ?? "").toString().replace("%", ""),
        );
        if (isNaN(pct) || pct >= 100) return null;
        return (precioActual / ((100 - pct) / 100)).toFixed(0);
      })()
    : null;

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-2xl overflow-hidden group cursor-pointer border border-[#F97316]/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
    >
      {/* Glow sutil al hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#F97316]/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* ── IMAGEN ── */}
      <div
        className={`aspect-square relative bg-[#FFF8F1]/40 overflow-hidden transition-all duration-500 ${isAgotado ? "opacity-40 grayscale" : "opacity-100"}`}
      >
        {" "}
        <AnimatePresence mode="wait">
          <motion.img
            key={indexImagen}
            src={todasLasFotos[indexImagen]}
            alt={producto.nombre}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`w-full h-full object-contain p-3 transition-transform duration-500 ${
              isAgotado ? "grayscale opacity-30" : "group-hover:scale-110"
            }`}
          />
        </AnimatePresence>
        {/* Badge imagen (descuento o nuevo) */}
        {imageBadge && !isAgotado && (
          <div
            className={`absolute top-2 left-2 px-2 py-[3px] rounded-md shadow z-10 ${imageBadge.className}`}
          >
            <span className="text-[10px] font-bold">{imageBadge.text}</span>
          </div>
        )}
        {/* Pocas unidades — badge animado */}
        {isPocas && (
          <div className="absolute bottom-2 left-2 bg-amber-500 px-2 py-[3px] rounded-md shadow animate-pulse z-10">
            <span className="text-[10px] font-bold text-white uppercase">
              {stockActual === 1 ? "Última unidad" : `Quedan ${stockActual}`}
            </span>
          </div>
        )}
        {/* Dots del carrusel */}
        {todasLasFotos.length > 1 && !isAgotado && (
          <div className="absolute bottom-2 right-2 flex gap-[3px] z-10">
            {todasLasFotos.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === indexImagen
                    ? "w-3 h-[5px] bg-[#F97316]"
                    : "w-[5px] h-[5px] bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
        {/* Agotado overlay */}
        {isAgotado && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            {/* Subí el z-index a 30 para que esté por encima de todo */}
            <div className="bg-red-600/90 px-4 py-2 rounded-xl border border-white/20 -rotate-12 shadow-xl backdrop-blur-md">
              <span className="text-[11px] font-[1000] text-white uppercase tracking-[0.2em] italic">
                Agotado
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="p-3 flex flex-col gap-2 relative z-10">
        {/* Nombre — altura fija para alinear tarjetas en grid */}
        <h3 className="text-[13px] font-semibold text-[#1F2937] uppercase leading-tight line-clamp-2 min-h-[34px] group-hover:text-[#F97316] transition-colors duration-200">
          {producto.nombre}
        </h3>

        {/* Precio + badge dinámico */}
        <div className="flex items-end justify-between min-h-[42px]">
          <div className="flex flex-col justify-end">
            {precioOriginal && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-[2px]">
                Bs {precioOriginal}
              </span>
            )}
            <div className="flex items-baseline gap-[3px]">
              <span className="text-[#F97316] text-[11px] font-bold uppercase">
                Bs
              </span>
              <span className="text-[19px] font-bold text-[#1F2937] leading-none">
                {precioActual.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Badge dinámico — cambia según el estado del producto */}
          <div
            className={`px-2 py-1 rounded-lg border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${dynamicBadge.className}`}
          >
            <span className="text-[8px] font-bold uppercase tracking-tight leading-[1.15] text-center max-w-[52px]">
              {dynamicBadge.text}
            </span>
          </div>
        </div>

        {/* Estrellas + barra de stock */}
        <div className="flex items-center justify-between pt-[2px]">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-[3px] rounded-md border border-gray-100">
            <StarRating stars={stars} />
            <span className="text-[10px] text-gray-500 font-medium">
              {stars}.0
            </span>
          </div>

          {/* Barra de stock — rellena el espacio vacío con info real */}
          <StockBar
            stock={stockActual}
            stockInicial={stockInicial}
            vendidos={vendidos}
          />
        </div>
      </div>

      {/* Borde naranja al hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-[#F97316]/0 group-hover:border-[#F97316]/15 transition-all duration-300 pointer-events-none z-20" />
    </motion.div>
  );
}
