"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── TIPOS ───────────────────────────────────────────────────────────────────
interface Pedido {
  id: number;
  nombre: string;
  celular: string;
  producto: string;
  cantidad: number;
  total: number;
  region: string;
  lat: number | null;
  lng: number | null;
  imagen_url: string;
  estado: "pendiente" | "verificado" | "enviado" | "entregado" | "rechazado";
  created_at: string;
}

// ─── CONFIG DE ESTADOS ────────────────────────────────────────────────────────
const ESTADOS = [
  {
    id: "pendiente",
    label: "Pendiente",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "verificado",
    label: "Verificado",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: "enviado",
    label: "Enviado",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "entregado",
    label: "Entregado",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: "rechazado",
    label: "Rechazado",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
] as const;

function getEstado(id: string) {
  return ESTADOS.find((e) => e.id === id) ?? ESTADOS[0];
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── MODAL COMPROBANTE ────────────────────────────────────────────────────────
function ModalComprobante({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt="Comprobante"
          className="w-full rounded-2xl border border-white/10 shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Abrir en pantalla completa
        </a>
      </motion.div>
    </motion.div>
  );
}

// ─── TARJETA DE PEDIDO ────────────────────────────────────────────────────────
function TarjetaPedido({
  pedido,
  onCambiarEstado,
  onVerComprobante,
}: {
  pedido: Pedido;
  onCambiarEstado: (id: number, estado: Pedido["estado"]) => void;
  onVerComprobante: (url: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const estado = getEstado(pedido.estado);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
    >
      {/* CABECERA — siempre visible */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpandido((v) => !v)}
      >
        {/* Thumb comprobante */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerComprobante(pedido.imagen_url);
          }}
          className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative group"
        >
          <img
            src={pedido.imagen_url}
            alt="Comprobante"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-gray-600 font-mono">
              #{pedido.id.toString().padStart(5, "0")}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${estado.color}`}
            >
              <span className={`w-[5px] h-[5px] rounded-full ${estado.dot}`} />
              {estado.label}
            </span>
          </div>
          <p className="text-[13px] font-black text-white truncate">
            {pedido.nombre}
          </p>
          <p className="text-[10px] text-gray-600 truncate">
            {pedido.producto}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-black text-[#f97316]">
            {Number(pedido.total).toFixed(2)}
            <span className="text-[10px] ml-0.5">Bs</span>
          </p>
          <p className="text-[9px] text-gray-600 mt-0.5">
            {formatFecha(pedido.created_at)}
          </p>
        </div>

        <svg
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expandido ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* DETALLE EXPANDIDO */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
              {/* Info rows */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Celular", value: `+591 ${pedido.celular}` },
                  { label: "Cantidad", value: `${pedido.cantidad} ud.` },
                  { label: "Dirección", value: pedido.region, full: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 ${row.full ? "col-span-2" : ""}`}
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">
                      {row.label}
                    </p>
                    <p className="text-[12px] font-bold text-gray-200 leading-tight">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Botones acción */}
              <div className="flex gap-2">
                {pedido.lat && pedido.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-blue-400"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Ver en mapa
                  </a>
                )}
                <a
                  href={`https://wa.me/591${pedido.celular}?text=${encodeURIComponent(`Hola ${pedido.nombre}, te contactamos de Kaori Store sobre tu pedido #${pedido.id.toString().padStart(5, "0")} 📦`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase text-emerald-400"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.87 9.87 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  WhatsApp
                </a>
                <button
                  onClick={() => onVerComprobante(pedido.imagen_url)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-gray-400 ml-auto"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Comprobante
                </button>
              </div>

              {/* Cambiar estado */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-2">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() =>
                        onCambiarEstado(pedido.id, e.id as Pedido["estado"])
                      }
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all ${
                        pedido.estado === e.id
                          ? `${e.color} scale-105`
                          : "bg-white/[0.03] border-white/5 text-gray-600 hover:border-white/15"
                      }`}
                    >
                      {e.icon}
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    hoy: 0,
    ingresos: 0,
  });

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPedidos(data);

      const hoy = new Date().toDateString();
      setStats({
        total: data.length,
        pendientes: data.filter((p) => p.estado === "pendiente").length,
        hoy: data.filter((p) => new Date(p.created_at).toDateString() === hoy)
          .length,
        ingresos: data
          .filter((p) => p.estado !== "rechazado")
          .reduce((acc, p) => acc + Number(p.total), 0),
      });
    }
    setLoading(false);
  }

  async function cambiarEstado(id: number, estado: Pedido["estado"]) {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    // Recalcular stats
    setPedidos((prev) => {
      setStats({
        total: prev.length,
        pendientes: prev.filter((p) => p.estado === "pendiente").length,
        hoy: prev.filter(
          (p) =>
            new Date(p.created_at).toDateString() === new Date().toDateString(),
        ).length,
        ingresos: prev
          .filter((p) => p.estado !== "rechazado")
          .reduce((acc, p) => acc + Number(p.total), 0),
      });
      return prev;
    });
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideEstado =
      filtroEstado === "todos" || p.estado === filtroEstado;
    const coincideBusqueda =
      !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.celular.includes(busqueda) ||
      p.producto.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, accent: false },
            {
              label: "Pendientes",
              value: stats.pendientes,
              accent: stats.pendientes > 0,
            },
            { label: "Hoy", value: stats.hoy, accent: false },
            {
              label: "Ingresos",
              value: `${stats.ingresos.toFixed(0)}Bs`,
              accent: false,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-2.5 border flex flex-col gap-0.5 ${
                s.accent
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-[#111] border-white/5"
              }`}
            >
              <span
                className={`text-[16px] font-black leading-none ${s.accent ? "text-amber-400" : "text-white"}`}
              >
                {s.value}
              </span>
              <span
                className={`text-[8px] font-bold uppercase tracking-wide ${s.accent ? "text-amber-500/60" : "text-gray-600"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide border transition-all ${
                filtroEstado === "todos"
                  ? "bg-white/10 border-white/15 text-white"
                  : "bg-white/[0.03] border-white/5 text-gray-600"
              }`}
            >
              Todos
            </button>
            {ESTADOS.map((e) => (
              <button
                key={e.id}
                onClick={() => setFiltroEstado(e.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide border transition-all ${
                  filtroEstado === e.id
                    ? `${e.color} scale-105`
                    : "bg-white/[0.03] border-white/5 text-gray-600"
                }`}
              >
                <span className={`w-[5px] h-[5px] rounded-full ${e.dot}`} />
                {e.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, celular o producto..."
              className="w-full bg-white/[0.04] border border-white/7 rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-gray-300 placeholder:text-gray-600 outline-none focus:border-orange-500/40 transition"
            />
          </div>
        </div>

        {/* LISTA */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4b5563"
                strokeWidth="1.5"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <p className="text-[12px] text-gray-600 font-bold uppercase tracking-widest">
              Sin pedidos
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-1">
              {pedidosFiltrados.length} pedido
              {pedidosFiltrados.length !== 1 ? "s" : ""}
            </p>
            <AnimatePresence>
              {pedidosFiltrados.map((pedido) => (
                <TarjetaPedido
                  key={pedido.id}
                  pedido={pedido}
                  onCambiarEstado={cambiarEstado}
                  onVerComprobante={setComprobanteUrl}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* MODAL COMPROBANTE */}
      <AnimatePresence>
        {comprobanteUrl && (
          <ModalComprobante
            url={comprobanteUrl}
            onClose={() => setComprobanteUrl(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
