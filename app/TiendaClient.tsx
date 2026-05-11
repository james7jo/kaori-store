"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarjetaProducto from "./components/TarjetaProducto";
import ModalDetalle from "./components/ModalDetalle";
import { agregarAlCarrito } from "./components/CartContext";
import VistaCarrito from "./components/VistaCarrito";
import { useSearchParams } from "next/navigation";
import {
  IconHome2,
  IconFlame,
  IconBolt,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";

// ─── PALETA "SUNSET ENERGY" (CLARA Y PROFESIONAL) ─── // NO QUITAR
// Fondo Base: #FFF8F1 (Crema/Naranja ultra claro, suave a la vista)
// Contenedores Secundarios: #FFFFFF (Blanco puro para tarjetas y elementos flotantes)
// Texto Principal: #1F2937 (Gris Pizarra muy oscuro para máxima legibilidad)
// Acento Principal: #F97316 (Naranja consolidado, transmite energía y acción)
// Acento Secundario/Hover: #EA580C (Naranja más oscuro para interacciones)

// ─── CARRUSEL INFINITO DE MARCAS ───
function MarcasAliadas() {
  const marcas = [
    "Ugreen",
    "Redragon",
    "Oster",
    "RAF",
    "Havit",
    "MSI",
    "Apple",
    "Motorola",
    "Sony",
    "Windows ",
    "Logitech",
    "Xiaomi",
    "Realme",
    "T-Dagger",
    "Office",
    "PSS",
    "Google",
    "Amazon",
    "Philips",
    "asus",
    "zotac",
    "helios",
    "antec",
    "corsair",
    "ewtto",
    "gigabyte",
  ];

  return (
    <div className="w-full py-10 bg-white overflow-hidden border-y border-orange-50">
      {/* Cambiamos el ancho a w-max para que se ajuste al contenido real 
         y no a un porcentaje inventado.
      */}
      <div className="flex w-max gap-8 animate-scroll-marcas hover:[animation-play-state:paused]">
        {/* Renderizamos las marcas dos veces: esto crea la ilusión de la cola */}
        {[...marcas, ...marcas].map((marca, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center px-10"
          >
            <span className="text-xl font-[1000] italic uppercase tracking-tighter text-slate-300 hover:text-[#F97316] transition-colors cursor-default">
              {marca}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll-marcas {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Se mueve exactamente la mitad de la tira completa.
               Como pusimos la lista 2 veces, al llegar al final de la primera,
               salta al inicio y parece que la fila nunca terminó.
            */
            transform: translateX(-50%);
          }
        }
        .animate-scroll-marcas {
          /* 40s para que sea un paseo suave y no corra */
          animation: scroll-marcas 80s linear infinite;
        }
      `}</style>
    </div>
  );
}
function CarruselSeccion({
  titulo,
  subtitulo,
  items,
  abrirProducto,
  tiempo = 8000,
  categoriaId, // <--- Nueva prop
  setCategoriaSel,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const intervalo = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const avance = 240 + Math.floor(Math.random() * 50);
          scrollRef.current.scrollBy({ left: avance, behavior: "smooth" });
        }
      }
    }, tiempo);
    return () => clearInterval(intervalo);
  }, [items.length, tiempo]);

  return (
    <section className="mb-14 w-full">
      {/* Título con su margen normal */}
      <div className="flex justify-between items-end px-6 mb-4">
        <div>
          <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.3em]">
            {subtitulo}
          </p>
          <h2 className="text-2xl font-[1000] italic uppercase text-[#1F2937] leading-none">
            {titulo}
          </h2>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            {/* BOTÓN VER MÁS - Reemplaza tus flechas con esto */}
            <button
              onClick={() => {
                setCategoriaSel(categoriaId);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 bg-white border border-orange-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#F97316] shadow-sm active:scale-95 transition-all"
            >
              Ver más
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div
          ref={scrollRef}
          /* EXPLICACIÓN PARA JOSE: 
             px-6 -> Crea el aire a los dos lados (izquierda y derecha por igual).
             -mx-0 -> Asegura que no haya márgenes raros.
          */
          className="flex gap-4 overflow-x-auto py-2 no-scrollbar snap-x snap-mandatory px-6"
        >
          {items.map((p: any) => (
            <div key={p.id} className="w-[190px] flex-shrink-0 snap-start">
              <TarjetaProducto producto={p} onClick={() => abrirProducto(p)} />
            </div>
          ))}
          {/* Este pequeño div es para que el último producto respire un poquito al final */}
          <div className="min-w-[1px] flex-shrink-0" />
        </div>
      ) : (
        <div className="px-6">
          <div className="bg-white/50 border-2 border-dashed border-orange-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2 opacity-50">📦</span>
            <p className="text-sm font-black text-slate-400 uppercase italic">
              Pronto tendremos más productos
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
// ─── CATEGORÍAS BIEN BOLIVIANAS Y ORDENADAS ─── // NO QUITAR
const categoriasConfig = [
  { id: "Todo", icon: "✨", label: "Novedades" },
  { id: "Tecno", icon: "🎧", label: "Tecnología y Accesorios" },
  { id: "Electro", icon: "🏠", label: "Electrodomésticos y Hogar" },
  { id: "PetShop", icon: "🐶", label: "Pet Shop / Mascotas" },
  { id: "Insumos", icon: "🩺", label: "Insumos Médicos" },
  { id: "PDF", icon: "📑", label: "Libros y PDFs" },
  { id: "Digital", icon: "🎮", label: "Juegos y Licencias" },
  { id: "Outlet", icon: "💎", label: "Ofertas Medio Uso" },
];
const subCategorias: Record<string, { id: string; label: string }[]> = {
  Tecno: [
    { id: "PC", label: "Acces. y Comp. de PC" },
    { id: "Celular", label: "Accesorios para Celular" },
  ],
  // Puedes agregar más subcategorías para Electro, PetShop, etc.
};
export function TiendaClient({
  productosIniciales = [],
}: {
  productosIniciales: any[];
}) {
  const [productos, setProductos] = useState<any[]>(productosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todo");
  const [subCategoriaSel, setSubCategoriaSel] = useState("Todas");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ubicacion, setUbicacion] = useState<any>(null);
  const [regionNombre, setRegionNombre] = useState<string>("");
  const [loadingGps, setLoadingGps] = useState(false);
  const searchParams = useSearchParams();
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  // 2. Efecto para CARGAR el carrito al entrar a la web
  useEffect(() => {
    // 1. Cargar el Carrito
    const carritoGuardado = localStorage.getItem("carrito_kaori");
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error("Error al cargar el carrito local:", error);
      }
    }
    // 2. Cargar la Ubicación y Región (¡REVISADO!)
    const locGuardada = localStorage.getItem("ubicacion_kaori");
    const regGuardada = localStorage.getItem("region_kaori");
    if (locGuardada) {
      // Cargamos el link directo, SIN JSON.parse
      setUbicacion(locGuardada);
    }
    if (regGuardada) {
      setRegionNombre(regGuardada);
    }
  }, []); // El array vacío hace que esto solo corra una vez al cargar la web, []);
  // 3. Efecto para GUARDAR el carrito automáticamente cada vez que cambie
  useEffect(() => {
    localStorage.setItem("carrito_kaori", JSON.stringify(carrito));
  }, [carrito]);
  // ─── LÓGICA DE CONTROL DE HISTORIAL (BOTÓN ATRÁS) ───
  // Su función es cerrar el cuadro de detalles del producto o buscador en lugar de cerrar toda la página web. // NO QUITAR
  useEffect(() => {
    const manejarBotonAtras = () => {
      if (sel) setSel(null);
      if (buscadorVisible) setBuscadorVisible(false);
    };
    window.addEventListener("popstate", manejarBotonAtras);
    return () => window.removeEventListener("popstate", manejarBotonAtras);
  }, [sel, buscadorVisible]);
  // ─── LÓGICA DE FILTRADO CORREGIDA ───
  const productosFiltrados = productos.filter((p) => {
    // 1. Búsqueda por texto
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    // 2. Filtro de Ofertas
    const coincideOferta = !soloOfertas || (p.descuento && p.descuento !== "");

    // 3. Filtro de Categoría Madre (Tecno, Electro, etc.)
    const coincideCatMadre =
      categoriaSel === "Todo" || p.categoria === categoriaSel;

    // 4. Filtro de Sub-categoría (PC, Celular)
    const coincideSubCat =
      subCategoriaSel === "Todas" || p.subcategoria === subCategoriaSel;

    return (
      coincideBusqueda && coincideCatMadre && coincideSubCat && coincideOferta
    );
  });
  // ─── LÓGICA DE SECCIONES ───
  const productosNovedades = useMemo(() => {
    const categorias = [
      "Tecno",
      "Electro",
      "PetShop",
      "Insumos",
      "Digital",
      "Outlet",
    ];
    return categorias
      .map((cat) => productos.find((p) => p.categoria === cat))
      .filter(Boolean);
  }, [productos]);

  const tecnoRandom = useMemo(
    () => productos.filter((p) => p.categoria === "Tecno").slice(0, 10),
    [productos],
  );
  const electroRandom = useMemo(
    () => productos.filter((p) => p.categoria === "Electro").slice(0, 10),
    [productos],
  );
  const petRandom = useMemo(
    () => productos.filter((p) => p.categoria === "PetShop").slice(0, 10),
    [productos],
  );
  const insumosRandom = useMemo(
    () => productos.filter((p) => p.categoria === "Insumos").slice(0, 10),
    [productos],
  );
  const pdfRandom = useMemo(
    () => productos.filter((p) => p.categoria === "PDF").slice(0, 10),
    [productos],
  );
  const digitalRandom = useMemo(
    () => productos.filter((p) => p.categoria === "Digital").slice(0, 10),
    [productos],
  );
  const outletRandom = useMemo(
    () => productos.filter((p) => p.categoria === "Outlet").slice(0, 10),
    [productos],
  );
  // Esta es la función que disparará el GPS
  const vincularGps = () => {
    setLoadingGps(true);
    setModoManual(false);
    // 1. Reloj de emergencia (8 segundos)
    const emergencia = setTimeout(() => {
      if (!ubicacion) {
        // Si después de 8 seg no hay nada, abortamos
        setLoadingGps(false);
        setModoManual(true);
        console.log("GPS muy lento, activando modo manual");
      }
    }, 8000);
    // 2. Pedir coordenadas al satélite
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(emergencia);
        const { latitude, longitude } = pos.coords;
        const coordsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        try {
          // 1. EL CAMBIO CLAVE: Agregamos &addressdetails=1 al final de la URL
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );
          const data = await res.json();
          // 2. SACAMOS LAS PIEZAS: Calle, Barrio y Ciudad
          const addr = data.address;
          const calle = addr.road || addr.pedestrian || addr.path || "";
          const barrio =
            addr.suburb || addr.neighbourhood || addr.village || "";
          const zona = addr.residential || addr.industrial || "";
          const ciudad = addr.city || addr.town || addr.county || "";
          const postCode = addr.postcode ? `(CP ${addr.postcode})` : "";

          // 3. ARMAMOS EL NOMBRE: Juntamos todo en una sola frase limpia
          const nombreDetallado = [calle, zona, barrio, ciudad, postCode]
            .filter(Boolean)
            .join(", ");
          setRegionNombre(nombreDetallado);

          const finalName = nombreDetallado || "Ubicación Detectada ✅";

          // 4. GUARDAR: En el estado y en la memoria del celular
          setUbicacion(coordsUrl);
          setRegionNombre(finalName);
          localStorage.setItem("ubicacion_kaori", coordsUrl);
          localStorage.setItem("region_kaori", finalName);
        } catch (error) {
          // Si falla el internet, al menos tenemos las coordenadas
          setUbicacion(coordsUrl);
          setRegionNombre("Ubicación Detectada ✅");
        }

        setLoadingGps(false);
      },
      (error) => {
        clearTimeout(emergencia);
        setLoadingGps(false);
        setModoManual(true);
        console.log("Error de GPS, pasando a manual");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };
  // ─── FUNCIÓN MAESTRA PARA CONECTAR MODAL Y CARRITO ───
  const handleAgregarAlCarrito = (productoConCantidad: any) => {
    // Usamos el "motor" del archivo CartContext
    agregarAlCarrito(productoConCantidad, carrito, setCarrito);
  };
  // ─── MANEJO DEL MODAL DE DETALLE Y HISTORIAL ─── // NO QUITAR
  const abrirProducto = (p: any) => {
    setSel(p);

    // 1. Esto cambia la URL arriba a ?p=ID sin recargar la página
    const nuevaUrl = `${window.location.pathname}?p=${p.id}`;
    window.history.pushState({ modalOpen: true }, "", nuevaUrl);
  };
  // Evita que el historial del navegador se llene de basura si cierras el modal manualmente. // NO QUITAR
  const cerrarProducto = () => {
    setSel(null);
    window.history.replaceState(null, "", window.location.pathname);
    if (window.history.state?.modalOpen) window.history.back();
  };

  return (
    // ─── EL FONDO ES SUNSET CREAM (#FFF8F1) - CLARO Y ENÉRGICO ─── // NO QUITAR
    <div className="bg-[#FFF8F1] text-[#1F2937] font-sans pb-10 overflow-x-hidden">
      {/* ─── SIDEBAR PREMIUM (ESTILO CLARO) ─── */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuAbierto(false)}
              className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              // FONDO TRANSPARENTE CON DESENFOQUE (GLASSMORPHISM)
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white/80 backdrop-blur-2xl z-[70] border-r-8 border-[#F97316] p-6 shadow-2xl flex flex-col rounded-r-[3rem]"
            >
              {/* LOGO IMPACTANTE */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <h1
                    translate="no"
                    className="text-3xl font-[1000] italic tracking-[-0.05em] uppercase leading-none text-[#1F2937]"
                  >
                    KAORI{" "}
                    <span className="text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                      STORE
                    </span>
                  </h1>
                </div>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="w-10 h-10 bg-white/50 rounded-2xl text-[#F97316] flex items-center justify-center shadow-sm border border-white/20 active:scale-90"
                >
                  ✕
                </button>
              </div>

              {/* LISTADO SIN SCROLL */}
              <div className="flex-1 flex flex-col gap-1.5 pt-2">
                <p className="text-[9px] font-black text-[#F97316] uppercase tracking-[0.4em] mb-2 ml-2">
                  Explorar
                </p>
                {categoriasConfig.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaSel(cat.id);
                      setSoloOfertas(false);
                      setMenuAbierto(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all border-2 ${
                      categoriaSel === cat.id && !soloOfertas
                        ? "bg-[#F97316] border-transparent text-white font-black shadow-[0_15px_30px_rgba(249,115,22,0.3)] scale-[1.03]"
                        : "bg-white/40 text-gray-600 border-white/20 hover:bg-white/60 hover:border-[#F97316]/20 hover:text-[#F97316]"
                    }`}
                  >
                    <span className="text-xl drop-shadow-sm">{cat.icon}</span>
                    <span className="text-[11px] uppercase font-black italic tracking-wider">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* PIE DEL SIDEBAR (REDES Y SOPORTE) - AHORA CON ICONOS REALES */}
              <div className="mt-auto pt-6 border-t-2 border-black/5 flex flex-col gap-3">
                {/* BOTONES DE REDES SOCIALES */}
                <div className="flex gap-2">
                  <a
                    href="https://www.instagram.com/kaoristore_bo"
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-2xl text-white shadow-lg active:scale-95 transition-all"
                  >
                    <span className="text-lg">📸</span>
                    <span className="text-[10px] font-black uppercase italic tracking-tighter">
                      Instagram
                    </span>
                  </a>

                  <a
                    href="https://www.tiktok.com/@kaori.han?_r=1&_t=ZS-95XiQ3gI9e4"
                    target="_blank"
                    // Tik Tok mantiene fondo negro absoluto
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-black rounded-2xl text-white shadow-lg active:scale-95 transition-all border-b-4 border-gray-800"
                  >
                    <svg
                      viewBox="0 0 448 512"
                      className="w-5 h-5 drop-shadow-[0_0_8px_rgba(31,235,231,0.5)]"
                      fill="white" // Color de relleno del icono
                    >
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase italic tracking-tighter ml-1">
                      Tik Tok
                    </span>
                  </a>
                </div>

                {/* CONTENEDOR DE BOTONES DE ACCIÓN */}
                <div className="flex items-stretch gap-3">
                  {/* 👤 BOTÓN ADMIN "PUERTA SECRETA" PREMIUM */}
                  <Link
                    href="/admin"
                    className="w-14 bg-[#1F2937] rounded-[1.8rem] flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] border border-white/10 active:scale-90 transition-all group"
                  >
                    <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      👤
                    </span>
                  </Link>

                  {/* 🟢 WHATSAPP SOPORTE (Ahora dentro del flex) */}
                  <a
                    href="https://wa.me/59174244882"
                    target="_blank"
                    className="flex-1 flex items-center justify-between p-5 bg-[#22c55e] rounded-[2.2rem] text-white shadow-[0_15px_30px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
                  >
                    <div className="text-left">
                      <p className="text-[9px] font-black text-white/70 uppercase">
                        Atención Inmediata
                      </p>
                      <p className="text-xs font-black uppercase italic">
                        WhatsApp Oficial
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      💬
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HEADER (SOLIDEZ Y ENERGÍA) ─── */}
      <div className="p-4 flex justify-between items-center bg-white/95 backdrop-blur-xl sticky top-0 z-40 border-b border-[#F97316]/10 shadow-sm">
        <div className="flex flex-col">
          <button
            onClick={() => {
              setCategoriaSel("Todo"); // Esto activa las Novedades y los carruseles
              setSoloOfertas(false); // Apaga el filtro de ofertas
              setBusqueda(""); // Borra lo que haya escrito en el buscador
              setBuscadorVisible(false); // Cierra el buscador si estaba abierto
              window.scrollTo({ top: 0, behavior: "smooth" }); // Sube al inicio suavemente
            }}
            className="group flex items-center gap-2 active:scale-95 transition-transform"
          >
            {/* Mini Emblema K */}
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)] group-hover:rotate-6 transition-transform">
              <span className="text-white text-xl font-black italic">K</span>
            </div>

            <div className="flex flex-col text-left">
              <h1
                translate="no"
                className="text-2xl font-[1000] italic tracking-[-0.05em] uppercase leading-none"
              >
                <span className="text-[#1F2937]">KAORI</span>
                <span className="text-[#F97316] ml-1 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                  STORE
                </span>
              </h1>
            </div>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[#1F2937] shadow-sm active:scale-90 transition-transform"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ─── BUSCADOR FLOTANTE ELEGANTE ─── */}
      <AnimatePresence>
        {buscadorVisible && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-start pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuscadorVisible(false)}
              // Degradado que desaparece hacia abajo
              className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-auto"
            />
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="w-full max-w-md relative pointer-events-auto"
            >
              <div className="bg-white rounded-[2rem] flex items-center px-6 py-5 border border-[#F97316]/20 shadow-[0_25px_60px_rgba(249,115,22,0.1)]">
                <span className="text-[#F97316] mr-4 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="¿Qué producto buscas?"
                  value={busqueda}
                  autoFocus
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent outline-none text-base w-full text-[#1F2937] font-medium placeholder-gray-400"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="ml-2 text-gray-400 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHIPS (CON DISEÑO SERIO) ─── */}
      <div
        ref={chipsScrollRef}
        className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-6 no-scrollbar"
      >
        {categoriasConfig.map((cat, i) => (
          <button
            key={cat.id}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            onClick={() => {
              setCategoriaSel(cat.id);
              setSoloOfertas(false);
              // Centrar el chip en pantalla
              setTimeout(() => {
                chipRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                });
              }, 50);
            }}
            className={`px-4 rounded-full font-black uppercase tracking-[0.05em] transition-all duration-300 flex-shrink-0 whitespace-nowrap ${
              categoriaSel === cat.id && !soloOfertas
                ? "bg-orange-500/10 text-[#F97316] border border-orange-500/30 text-[12px] py-2.5 scale-105"
                : "bg-white text-gray-300 border border-[#ebebeb] text-[10px] py-2"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="px-4 mb-4">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          {productosFiltrados.length} productos
        </span>
      </div>
      {/* PRODUCTOS */}
      {/* ─── PASILLOS INTELIGENTES DE KAORI STORE ─── */}
      <div className="pb-10">
        {categoriaSel === "Todo" && !busqueda && !soloOfertas ? (
          <>
            {/* 1. SECCIÓN NOVEDADES (Corregido el nombre de la variable) */}
            <div className="px-6 mb-14">
              <div className="grid grid-cols-2 gap-5">
                {productosNovedades.map((p) => (
                  <TarjetaProducto
                    key={p.id}
                    producto={p}
                    onClick={() => abrirProducto(p)}
                  />
                ))}
              </div>
            </div>

            {/* 2. PASILLO HOGAR */}
            <CarruselSeccion
              titulo="Hogar"
              subtitulo="Electrodomésticos y Hogar"
              items={electroRandom}
              abrirProducto={abrirProducto}
              tiempo={6000}
              categoriaId="Electro"
              setCategoriaSel={setCategoriaSel}
            />
            {/* 3. PASILLO TECNOLOGÍA */}
            <CarruselSeccion
              titulo="Tecnología"
              subtitulo="Gamer & Accesorios"
              items={tecnoRandom}
              abrirProducto={abrirProducto}
              tiempo={9500}
              categoriaId="Tecno"
              setCategoriaSel={setCategoriaSel}
            />

            {/* 4. PASILLO MASCOTAS */}
            <CarruselSeccion
              titulo="Mascotas"
              subtitulo="Pet Shop & Care"
              items={petRandom}
              abrirProducto={abrirProducto}
              tiempo={7200}
              categoriaId="PetShop"
              setCategoriaSel={setCategoriaSel}
            />

            {/* 5. PASILLO INSUMOS MÉDICOS */}
            <CarruselSeccion
              titulo="Salud"
              subtitulo="Insumos Médicos"
              items={insumosRandom}
              abrirProducto={abrirProducto}
              tiempo={11000}
              categoriaId="Insumos"
              setCategoriaSel={setCategoriaSel}
            />

            {/* BANNER PUBLICITARIO */}
            {/* ─── REMPLAZO: CARRUSEL DE MARCAS EN LUGAR DEL BANNER OSCURO ─── */}
            <div className="my-14">
              <MarcasAliadas />
            </div>

            {/* 6. PASILLO DIGITAL */}
            <CarruselSeccion
              titulo="Juegos y Licencias"
              subtitulo="Entretenimiento Digital"
              items={digitalRandom}
              abrirProducto={abrirProducto}
              categoriaId="Digital"
              setCategoriaSel={setCategoriaSel}
            />

            {/* 7. PASILLO PDFs */}
            <CarruselSeccion
              titulo="Lectura"
              subtitulo="Libros y PDFs"
              items={pdfRandom}
              abrirProducto={abrirProducto}
              categoriaId="PDF"
              setCategoriaSel={setCategoriaSel}
            />

            {/* 8. PASILLO OUTLET */}
            <CarruselSeccion
              titulo="Outlet"
              subtitulo="Ofertas Medio Uso"
              items={outletRandom}
              abrirProducto={abrirProducto}
              categoriaId="Outlet"
              setCategoriaSel={setCategoriaSel}
            />
          </>
        ) : (
          /* ─── MODO LISTA LARGA (Cuando el cliente busca o filtra) ─── */
          <div className="px-4 grid grid-cols-2 gap-5">
            {productosFiltrados.map((p) => (
              <TarjetaProducto
                key={p.id}
                producto={p}
                onClick={() => abrirProducto(p)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#ebebeb] px-2 py-2.5 pb-4 flex items-center justify-around z-50">
        {/* INICIO */}
        <button
          onClick={() => {
            setCategoriaSel("Todo");
            setSoloOfertas(false);
            setBusqueda("");
            setBuscadorVisible(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-1/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <IconHome2
            size={21}
            stroke={1.8}
            className={`transition-colors ${
              categoriaSel === "Todo" && !soloOfertas && !buscadorVisible
                ? "text-[#F97316]"
                : "text-gray-300"
            }`}
          />
          <span
            className={`text-[8px] font-black uppercase tracking-[0.06em] transition-colors ${
              categoriaSel === "Todo" && !soloOfertas && !buscadorVisible
                ? "text-[#F97316]"
                : "text-gray-300"
            }`}
          >
            Inicio
          </span>
        </button>

        {/* OFERTAS */}
        <button
          onClick={() => {
            setSoloOfertas(true);
            setCategoriaSel("Todo");
            setBuscadorVisible(false);
          }}
          className="w-1/5 flex flex-col items-center gap-1 active:scale-95 transition-transform relative"
        >
          {productos.some((p) => p.descuento) && (
            <span className="absolute top-0 right-[calc(50%-17px)] w-[5px] h-[5px] bg-[#EF4444] rounded-full" />
          )}
          <IconFlame
            size={21}
            stroke={1.8}
            className={`transition-colors ${
              soloOfertas ? "text-[#EF4444]" : "text-gray-300"
            }`}
          />
          <span
            className={`text-[8px] font-black uppercase tracking-[0.06em] transition-colors ${
              soloOfertas ? "text-[#EF4444]" : "text-gray-300"
            }`}
          >
            Ofertas
          </span>
        </button>

        {/* EXPLORAR — outline, mismo nivel */}
        <button
          onClick={() => setMenuAbierto(true)}
          className="w-1/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <div className="w-[40px] h-[40px] rounded-[12px] border border-[#F97316] flex items-center justify-center">
            <IconBolt size={19} stroke={2} className="text-[#F97316]" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.06em] text-[#F97316]">
            Explorar
          </span>
        </button>

        {/* BUSCAR */}
        <button
          onClick={() => setBuscadorVisible(!buscadorVisible)}
          className="w-1/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <IconSearch
            size={21}
            stroke={1.8}
            className={`transition-colors ${
              buscadorVisible ? "text-[#F97316]" : "text-gray-300"
            }`}
          />
          <span
            className={`text-[8px] font-black uppercase tracking-[0.06em] transition-colors ${
              buscadorVisible ? "text-[#F97316]" : "text-gray-300"
            }`}
          >
            Buscar
          </span>
        </button>

        {/* CARRITO */}
        <button
          onClick={() => setCartOpen(true)}
          className="w-1/5 flex flex-col items-center gap-1 active:scale-95 transition-transform relative"
        >
          <AnimatePresence>
            {carrito.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 right-[calc(50%-19px)] bg-[#F97316] text-white text-[8px] w-[15px] h-[15px] rounded-full flex items-center justify-center font-black border-2 border-white"
              >
                {carrito.length}
              </motion.span>
            )}
          </AnimatePresence>
          <IconShoppingCart
            size={21}
            stroke={1.8}
            className={`transition-colors ${
              cartOpen ? "text-[#F97316]" : "text-gray-300"
            }`}
          />
          <span
            className={`text-[8px] font-black uppercase tracking-[0.06em] transition-colors ${
              cartOpen ? "text-[#F97316]" : "text-gray-300"
            }`}
          >
            Carrito
          </span>
        </button>
      </div>

      <AnimatePresence>
        {sel && (
          <ModalDetalle
            producto={sel}
            onClose={cerrarProducto}
            onAgregar={handleAgregarAlCarrito}
            ubicacion={ubicacion}
            regionNombre={regionNombre}
            vincularGps={vincularGps}
            loadingGps={loadingGps}
            modoManual={modoManual}
            setModoManual={setModoManual}
          />
        )}
      </AnimatePresence>
      <VistaCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        ubicacion={ubicacion}
        loadingGps={loadingGps}
        regionNombre={regionNombre}
        vincularGps={vincularGps}
      />
    </div>
  );
}
