"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  galeria: string;
  descuento?: string;
  vendidos?: number;
  stock?: number;
  consultas?: number;
  categoria?: string;
  subcategoria?: string;
  estado?: string;
  video_url?: string;
}

type FormState = {
  nombre: string;
  precio: string;
  descripcion: string;
  imagen: string;
  galeria: string;
  descuento: string;
  stock: string;
  categoria: string;
  subcategoria: string;
  estado: string;
  video_url: string;
};

const FORM_VACIO: FormState = {
  nombre: "",
  precio: "",
  descripcion: "",
  imagen: "",
  galeria: "",
  descuento: "",
  stock: "",
  categoria: "Todo",
  subcategoria: "Todas",
  estado: "nuevo",
  video_url: "",
};

const OPCIONES_CATEGORIA = [
  { id: "Todo", label: "General / Novedades" },
  { id: "Tecno", label: "Tecnologia y accesorios" },
  { id: "Electro", label: "Electro & hogar" },
  { id: "Insumos", label: "Insumos Médicos" },
  { id: "PDF", label: "Libros y PDFs" },
  { id: "Digital", label: "Juegos y Licencias" },
  { id: "Outlet", label: "Ofertas Medio Uso" },
  { id: "PetShop", label: "Pet Shop / Mascotas" },
];
const OPCIONES_SUB_TECNO = [
  { id: "PC", label: "💻 Componentes de PC" },
  { id: "Celular", label: "📱 Accesorios para Celular" },
];
const OPCIONES_ESTADO = [
  { id: "nuevo", label: "✨ Nuevo " },
  { id: "usado", label: "♻️ Usado " },
];

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent = false,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-1.5 border relative overflow-hidden ${
        accent
          ? "bg-gradient-to-br from-orange-600 to-red-700 border-transparent"
          : "bg-[#141414] border-white/5"
      }`}
    >
      {icon && (
        <span className="absolute right-4 top-4 text-2xl opacity-20 select-none">
          {icon}
        </span>
      )}
      <span
        className={`text-[10px] font-black uppercase tracking-[0.25em] ${
          accent ? "text-orange-200" : "text-gray-600"
        }`}
      >
        {label}
      </span>
      <span className="text-3xl font-black italic leading-none text-white">
        {value}
      </span>
      {sub && (
        <span
          className={`text-[10px] font-bold truncate ${accent ? "text-orange-200/70" : "text-gray-700"}`}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA INVENTARIO
// ─────────────────────────────────────────────
function TarjetaInventario({
  producto: p,
  onEditar,
  onEliminar,
}: {
  producto: Producto;
  onEditar: (p: Producto) => void;
  onEliminar: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="group bg-[#141414] border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-[#0d0d0d] overflow-hidden flex-shrink-0">
        <img
          src={p.imagen}
          alt={p.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md flex flex-col gap-1">
          <span className="text-[8px] font-black tracking-widest text-gray-400 uppercase">
            #{p.id.toString().padStart(4, "0")}
          </span>
          <span className="text-[7px] font-black tracking-widest text-orange-500 uppercase">
            {p.categoria || "Todo"}
          </span>
        </div>
        {p.descuento && (
          <div className="absolute top-2.5 right-2.5 bg-red-600 px-2 py-0.5 rounded-md">
            <span className="text-[9px] font-black text-white">
              -{p.descuento}
            </span>
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <span className="text-[9px]">💬</span>
          <span className="text-[9px] font-black text-orange-400">
            {p.consultas ?? 0}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-sm font-black italic text-white leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-orange-400 transition-colors">
            {p.nombre}
          </p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-orange-500 text-[11px] font-bold">Bs</span>
            <span className="text-orange-400 text-xl font-black italic">
              {p.precio}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEditar(p)}
            className="flex-1 py-2.5 bg-white/6 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-orange-600 hover:text-white hover:border-transparent active:scale-[0.95] transition-all flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button
            onClick={() => onEliminar(p.id)}
            className="px-4 py-2.5 bg-red-900/20 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white hover:border-transparent active:scale-[0.95] transition-all flex items-center justify-center"
            title="Eliminar producto"
          >
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// CAMPO DE FORMULARIO
// ─────────────────────────────────────────────
function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3.5 bg-white/5 border border-white/8 rounded-xl outline-none focus:border-orange-500/70 focus:bg-white/8 transition-all text-white placeholder-gray-600 text-sm font-medium appearance-none";

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboardKaori() {
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const ITEMS_POR_PAGINA = 10;
  const [subiendoGaleria, setSubiendoGaleria] = useState(false);
  const handleSubirGaleria = async (archivos: File[]) => {
    setSubiendoGaleria(true);
    const urlsSubidas: string[] = [];

    try {
      // Recorremos cada imagen seleccionada
      for (const archivo of archivos) {
        const fileExt = archivo.name.split(".").pop();
        // Creamos un nombre único: producto-ID-random.png
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `galeria-productos/${fileName}`;

        // Subimos al Storage (Asegúrate de que tu bucket se llame 'productos')
        const { error: uploadError, data } = await supabase.storage
          .from("productos")
          .upload(filePath, archivo);

        if (uploadError) {
          console.error("Error al subir una imagen:", uploadError.message);
          continue; // Si falla una, sigue con la otra
        }

        // Obtenemos la URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("productos").getPublicUrl(filePath);

        urlsSubidas.push(publicUrl);
      }

      // --- AQUÍ EL PASO CLAVE ---
      // Ahora 'urlsSubidas' es un array de strings.
      // Tienes que guardarlo en tu tabla de productos en la columna 'galeria' (que sea tipo JSONB o Text[])
      console.log("Todas las fotos listas:", urlsSubidas);

      // Actualiza el estado de tu formulario principal con estas URLs
      // setFormulario({ ...formulario, galeria: urlsSubidas });
    } catch (error) {
      alert("Ocurrió un error subiendo la galería");
    } finally {
      setSubiendoGaleria(false);
    }
  };
  const eliminarDeGaleria = (urlAEliminar: string) => {
    const fotosActuales = form.galeria ? form.galeria.split(",") : [];
    const nuevaGaleria = fotosActuales.filter((url) => url !== urlAEliminar);
    setForm({ ...form, galeria: nuevaGaleria.join(",") });
  };
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginaActual, setPaginaActual] = useState(0);
  const [statsTotales, setStatsTotales] = useState({
    dinero: 0,
    descuentos: 0,
    pendientes: 0,
  });
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [subiendo, setSubiendo] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todo");
  const [seccion, setSeccion] = useState<"inventario" | "agregar">(
    "inventario",
  );

  async function cargarMetricasGlobales() {
    const [productosRes, pedidosRes] = await Promise.all([
      supabase.from("productos").select("precio, descuento"),
      supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente"),
    ]);

    const data = productosRes.data ?? [];
    const pendientes = pedidosRes.count ?? 0;

    const dinero = data.reduce((acc, p) => acc + Number(p.precio), 0);
    const descuentos = data.filter(
      (p) => p.descuento && p.descuento !== "",
    ).length;
    setStatsTotales({ dinero, descuentos, pendientes });
  }
  useEffect(() => {
    setBuscando(true);
    setPaginaActual(0);
    const timeout = setTimeout(() => {
      cargarInventario();
    }, 400);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  async function cargarInventario() {
    const desde = paginaActual * ITEMS_POR_PAGINA;
    const hasta = desde + ITEMS_POR_PAGINA - 1;

    let consulta = supabase.from("productos").select("*", { count: "exact" });

    if (filtroCategoria !== "Todo") {
      consulta = consulta.eq("categoria", filtroCategoria);
    }

    // 👇 Búsqueda real en Supabase — busca en TODOS los productos, no solo los 10 cargados
    if (busqueda.trim() !== "") {
      consulta = consulta.ilike("nombre", `%${busqueda.trim()}%`);
    }

    const { data, count, error } = await consulta
      .order("id", { ascending: false })
      .range(desde, hasta);

    if (!error) {
      setProductos(data || []);
      setTotalItems(count || 0);
      setBuscando(false);
    }
  }

  const prepararEdicion = (p: Producto) => {
    setIdEditando(p.id);
    setForm({
      nombre: p.nombre,
      precio: String(p.precio),
      descripcion: p.descripcion,
      imagen: p.imagen,
      galeria: p.galeria ?? "",
      video_url: p.video_url ?? "",
      descuento: p.descuento ?? "",
      stock: p.stock !== undefined ? String(p.stock) : "",
      categoria: p.categoria || "Todo",
      estado: p.estado || "nuevo",
      subcategoria: (p as any).subcategoria || "Todas",
    });
    setSeccion("agregar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setForm(FORM_VACIO);
    setSeccion("inventario");
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    await supabase.from("productos").delete().eq("id", id);
    cargarInventario();
    cargarMetricasGlobales();
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);

    const fPrincipal = (document.getElementById("foto") as HTMLInputElement)
      ?.files?.[0];
    const fGaleria = (document.getElementById("galeria") as HTMLInputElement)
      ?.files;

    try {
      let urlPrincipal = form.imagen;
      let urlsGaleria = form.galeria ? form.galeria.split(",") : [];

      // --- SUBIDA DE IMAGEN PRINCIPAL ---
      if (fPrincipal) {
        const nom = `${Date.now()}_main.png`;
        const { error: uploadError } = await supabase.storage
          .from("productos")
          .upload(nom, fPrincipal);
        if (uploadError) throw uploadError;
        urlPrincipal = supabase.storage.from("productos").getPublicUrl(nom)
          .data.publicUrl;
      }

      // --- SUBIDA DE GALERÍA ---
      if (fGaleria && fGaleria.length > 0) {
        const nuevasUrls: string[] = [];
        for (let i = 0; i < fGaleria.length; i++) {
          const nomG = `${Date.now()}_gal_${i}.png`;
          await supabase.storage.from("productos").upload(nomG, fGaleria[i]);
          nuevasUrls.push(
            supabase.storage.from("productos").getPublicUrl(nomG).data
              .publicUrl,
          );
        }
        urlsGaleria = [...urlsGaleria, ...nuevasUrls];
      }

      // ─── LÓGICA DE STOCK INTELIGENTE ───
      const nuevoStock = parseInt(form.stock) || 0;
      let nuevosVendidos = 0;

      if (idEditando) {
        const productoOriginal = productos.find((p) => p.id === idEditando);
        if (productoOriginal) {
          const stockAnterior = productoOriginal.stock || 0;
          const vendidosAnteriores = productoOriginal.vendidos || 0;
          const diferencia = stockAnterior - nuevoStock;
          if (diferencia > 0) {
            nuevosVendidos = vendidosAnteriores + diferencia;
          } else {
            nuevosVendidos = vendidosAnteriores;
          }
        }
      }

      // ─── LÓGICA ANTI-FLOJERA PARA DESCUENTOS (PORCENTAJE AUTOMÁTICO) ───
      let descuentoParaGuardar: string | null = form.descuento.trim();
      if (descuentoParaGuardar !== "") {
        // Quitamos espacios por si acaso
        descuentoParaGuardar = descuentoParaGuardar.replace(/\s+/g, "");
        // Si no tiene el %, se lo ponemos nosotros
        if (!descuentoParaGuardar.includes("%")) {
          descuentoParaGuardar = `${descuentoParaGuardar}%`;
        }
      } else {
        descuentoParaGuardar = null;
      }

      // --- PREPARACIÓN DE DATOS FINAL ---
      const datos: any = {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion,
        imagen: urlPrincipal,
        galeria: urlsGaleria.join(","),
        video_url: form.video_url,
        descuento: descuentoParaGuardar, // Usamos la variable procesada arriba
        stock: nuevoStock,
        categoria: form.categoria || "Todo",
        subcategoria: form.categoria === "Tecno" ? form.subcategoria : null,
        estado: form.estado,
        vendidos: nuevosVendidos,
      };

      // --- GUARDADO EN SUPABASE ---
      if (idEditando) {
        await supabase.from("productos").update(datos).eq("id", idEditando);
      } else {
        await supabase
          .from("productos")
          .insert([{ ...datos, vendidos: 0, consultas: 0 }]);
      }

      cancelarEdicion();
      cargarInventario();
      cargarMetricasGlobales();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const filtradosLocal = productos.filter(
    (p) => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <main className="max-w-7xl mx-auto px-5 py-8 space-y-10">
        {/* STAT CARDS DINÁMICOS GLOBALES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Productos"
            value={totalItems}
            accent
            icon="📦"
            sub="Total en tienda"
          />
          <StatCard
            label="Capital Total"
            value={`Bs ${statsTotales.dinero.toLocaleString()}`}
            icon="💰"
            sub="Valor total stock"
          />
        </div>

        <AnimatePresence mode="wait">
          {seccion === "inventario" && (
            <motion.div
              key="inventario"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* FILTROS Y BÚSQUEDA */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111] p-4 rounded-[2rem] border border-white/5">
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                  {OPCIONES_CATEGORIA.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFiltroCategoria(cat.id);
                        setPaginaActual(0);
                      }}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex-shrink-0 border ${filtroCategoria === cat.id ? "bg-orange-600 border-transparent text-white" : "bg-white/5 border-white/5 text-gray-500"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar en esta página..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm outline-none focus:border-orange-500/50 text-gray-300"
                  />
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtradosLocal.map((p) => (
                  <TarjetaInventario
                    key={p.id}
                    producto={p}
                    onEditar={prepararEdicion}
                    onEliminar={eliminarProducto}
                  />
                ))}
              </div>

              {/* PAGINACIÓN */}
              <div className="flex justify-center items-center gap-8 pt-10">
                <button
                  disabled={paginaActual === 0}
                  onClick={() => {
                    setPaginaActual((p) => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase text-gray-500 disabled:opacity-10 active:scale-95 transition-all"
                >
                  ← Anterior
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-orange-500 font-black italic">
                    Pág. {paginaActual + 1}
                  </span>
                  <span className="text-[8px] text-gray-600 uppercase font-bold tracking-widest text-center">
                    de {Math.ceil(totalItems / ITEMS_POR_PAGINA) || 1}
                  </span>
                </div>
                <button
                  disabled={(paginaActual + 1) * ITEMS_POR_PAGINA >= totalItems}
                  onClick={() => {
                    setPaginaActual((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase text-gray-500 disabled:opacity-10 active:scale-95 transition-all"
                >
                  Siguiente →
                </button>
              </div>
            </motion.div>
          )}

          {seccion === "agregar" && (
            <motion.div
              key="formulario"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="relative bg-[#111] border border-white/8 rounded-[2rem] overflow-hidden shadow-2xl">
                <form
                  onSubmit={manejarEnvio}
                  className="relative z-10 p-8 space-y-8"
                >
                  <h3 className="text-2xl font-black italic uppercase text-white">
                    {idEditando ? "Editar producto" : "Nuevo producto"}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <Campo label="Nombre">
                        <input
                          type="text"
                          placeholder="nombre del producto"
                          value={form.nombre}
                          onChange={(e) =>
                            setForm({ ...form, nombre: e.target.value })
                          }
                          className={inputCls}
                          required
                        />
                      </Campo>
                      <Campo label="Sección / Categoría">
                        <div className="relative">
                          <select
                            value={form.categoria}
                            onChange={(e) =>
                              setForm({ ...form, categoria: e.target.value })
                            }
                            className={`${inputCls} cursor-pointer`}
                          >
                            {OPCIONES_CATEGORIA.map((opt) => (
                              <option
                                key={opt.id}
                                value={opt.id}
                                className="bg-[#111] text-white"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            ▼
                          </div>
                        </div>
                      </Campo>
                      <AnimatePresence>
                        {form.categoria === "Tecno" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <Campo label="Sub-Categoría de Tecnología">
                              <div className="relative">
                                <select
                                  value={form.subcategoria}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      subcategoria: e.target.value,
                                    })
                                  }
                                  className={`${inputCls} border-orange-500/40 bg-orange-500/5`}
                                >
                                  <option value="Todas" className="bg-[#111]">
                                    Seleccionar sub-tipo...
                                  </option>
                                  {OPCIONES_SUB_TECNO.map((opt) => (
                                    <option
                                      key={opt.id}
                                      value={opt.id}
                                      className="bg-[#111]"
                                    >
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                                  ▼
                                </div>
                              </div>
                            </Campo>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="grid grid-cols-2 gap-4">
                        <Campo label="Precio (Bs)">
                          <input
                            type="number"
                            // El step="0.01" permite subir de a 1 centavo y habilita los decimales en el formulario
                            step="0.01"
                            placeholder="precio con centavos"
                            value={form.precio}
                            onChange={(e) =>
                              setForm({ ...form, precio: e.target.value })
                            }
                            className={inputCls}
                            required
                          />
                        </Campo>
                        <Campo label="Descuento">
                          <input
                            type="text"
                            placeholder="Ej: 20%"
                            value={form.descuento}
                            onChange={(e) =>
                              setForm({ ...form, descuento: e.target.value })
                            }
                            className={inputCls}
                          />
                        </Campo>
                      </div>
                      <Campo label="Descripción">
                        <textarea
                          placeholder="describe tu producto"
                          value={form.descripcion}
                          onChange={(e) =>
                            setForm({ ...form, descripcion: e.target.value })
                          }
                          className={`${inputCls} h-36 resize-none`}
                          required
                        />
                      </Campo>
                    </div>
                    <div className="space-y-5">
                      <Campo label="Stock (Unidades)">
                        <input
                          type="number"
                          placeholder="cuantos tienes?"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({ ...form, stock: e.target.value })
                          }
                          className={inputCls}
                        />
                      </Campo>
                      <Campo label="Condición del Artículo">
                        <div className="flex gap-2">
                          {OPCIONES_ESTADO.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setForm({ ...form, estado: opt.id })
                              }
                              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                form.estado === opt.id
                                  ? "bg-orange-600 border-transparent text-white shadow-lg shadow-orange-900/20"
                                  : "bg-white/5 border-white/10 text-gray-500 hover:border-orange-500/50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </Campo>
                      <Campo label="Link de Video (YouTube)">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                            🎬
                          </span>
                          <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={form.video_url}
                            onChange={(e) =>
                              setForm({ ...form, video_url: e.target.value })
                            }
                            className={`${inputCls} pl-12 border-orange-500/20 focus:border-orange-500`}
                          />
                        </div>
                        <p className="text-[9px] text-gray-500 italic mt-1 ml-2">
                          * Pega el link directo. El sistema lo convertirá
                          automáticamente para la tienda.
                        </p>
                      </Campo>
                      <Campo label="Foto principal">
                        <input
                          type="file"
                          id="foto"
                          accept="image/*"
                          className="w-full text-xs text-gray-500 file:bg-orange-600 file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white"
                        />
                      </Campo>
                      {(form.imagen || idEditando) && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative group w-fit">
                          <p className="text-[9px] font-black uppercase text-gray-600 mb-2">
                            Imagen Principal
                          </p>

                          <div className="relative w-20 h-20">
                            <img
                              src={form.imagen}
                              className="w-full h-full object-cover rounded-lg border border-white/10 shadow-md"
                              alt="Preview principal"
                            />

                            {/* BOTÓN X PARA LIMPIAR LA IMAGEN PRINCIPAL */}
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, imagen: "" })}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-[#111] hover:scale-110 active:scale-90 transition-all z-10"
                              title="Quitar imagen principal"
                            >
                              <span className="text-[10px] font-bold">✕</span>
                            </button>
                          </div>

                          {/* Mensaje de ayuda sutil */}
                          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap">
                            <p className="text-[10px] text-red-500 font-bold italic">
                              ← Quitar foto
                            </p>
                          </div>
                        </div>
                      )}

                      <Campo label="Galería adicional">
                        <div className="space-y-2">
                          <input
                            type="file"
                            id="galeria"
                            accept="image/*"
                            multiple
                            disabled={subiendoGaleria}
                            className="w-full text-xs text-gray-500 file:bg-[#F97316] file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white file:font-bold file:cursor-pointer disabled:opacity-50"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                handleSubirGaleria(Array.from(files)); // Convertimos FileList a Array
                              }
                            }}
                          />
                          {subiendoGaleria && (
                            <p className="text-[10px] text-orange-500 animate-pulse font-bold italic">
                              🚀 Subiendo imágenes a Kaori Store...
                            </p>
                          )}
                        </div>
                      </Campo>
                      {/* VISUALIZADOR DE GALERÍA CON BOTÓN ELIMINAR */}
                      {form.galeria && (
                        <Campo label="Fotos actuales en galería">
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            {form.galeria
                              .split(",")
                              .filter((url) => url !== "")
                              .map((url, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-square"
                                >
                                  <img
                                    src={url}
                                    className="w-full h-full object-cover rounded-xl border border-white/10 shadow-lg"
                                    alt="Miniatura galería"
                                  />
                                  {/* BOTÓN PARA ELIMINAR CADA FOTO */}
                                  <button
                                    type="button"
                                    onClick={() => eliminarDeGaleria(url)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-[#111] hover:scale-110 active:scale-90 transition-all z-10"
                                  >
                                    <span className="text-[10px] font-bold">
                                      ✕
                                    </span>
                                  </button>

                                  {/* EFECTO VISUAL AL PASAR EL MOUSE */}
                                  <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none transition-opacity" />
                                </div>
                              ))}
                          </div>
                          <p className="text-[9px] text-gray-600 italic mt-2">
                            * Toca la "✕" roja para quitar una imagen de la
                            galería. No olvides "Guardar Cambios" al finalizar.
                          </p>
                        </Campo>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={subiendo}
                      className={`flex-1 py-4 rounded-2xl font-black italic text-lg uppercase shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                        subiendo
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70 animate-pulse" // ESTADO BLOQUEADO
                          : "bg-gradient-to-r from-orange-600 to-red-700 text-white active:scale-95 shadow-orange-900/20" // ESTADO ACTIVO
                      }`}
                    >
                      {subiendo ? (
                        <>
                          <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          Procesando...
                        </>
                      ) : idEditando ? (
                        "Guardar Cambios"
                      ) : (
                        "Publicar Ahora"
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={subiendo} // También bloqueamos el cancelar para que no interrumpa la subida
                      onClick={cancelarEdicion}
                      className={`px-8 py-4 rounded-2xl font-black uppercase text-sm transition-all ${
                        subiendo
                          ? "bg-white/5 text-gray-700 cursor-not-allowed"
                          : "bg-white/5 border border-white/8 text-gray-500 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      // Dentro del return de AdminDashboard, antes del último
      {seccion === "inventario" && (
        <button
          onClick={() => setSeccion("agregar")}
          className="fixed bottom-6 right-5 z-30 w-14 h-14 bg-[#f97316] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(249,115,22,0.4)] active:scale-90 transition-all"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
