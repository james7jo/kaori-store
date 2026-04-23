"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TarjetaProducto from "./components/TarjetaProducto";
import ModalDetalle from "./components/ModalDetalle";
import { agregarAlCarrito } from "./components/CartContext";
import VistaCarrito from "./components/VistaCarrito";

// ─── PALETA "SUNSET ENERGY" (CLARA Y PROFESIONAL) ─── // NO QUITAR
// Fondo Base: #FFF8F1 (Crema/Naranja ultra claro, suave a la vista)
// Contenedores Secundarios: #FFFFFF (Blanco puro para tarjetas y elementos flotantes)
// Texto Principal: #1F2937 (Gris Pizarra muy oscuro para máxima legibilidad)
// Acento Principal: #F97316 (Naranja consolidado, transmite energía y acción)
// Acento Secundario/Hover: #EA580C (Naranja más oscuro para interacciones)
export const dynamic = "force-dynamic";
// ─── COMPONENTE PARA LAS FILAS HORIZONTALES ───
import { useRef } from "react";

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
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" })
              }
              className="w-9 h-9 bg-white border border-orange-100 rounded-full flex items-center justify-center text-xs shadow-sm"
            >
              ←
            </button>
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })
              }
              className="w-9 h-9 bg-white border border-orange-100 rounded-full flex items-center justify-center text-xs shadow-sm"
            >
              →
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
          className="flex gap-4 overflow-x-auto py-2 no-scrollbar snap-x snap-mandatory px-96"
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
export default function CatalogoKaori() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todo");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [sel, setSel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  // 1. Declaramos el carrito, pero primero intentamos leer si ya tiene algo guardado
  const [carrito, setCarrito] = useState<any[]>([]);
  const [subCategoriaSel, setSubCategoriaSel] = useState("Todas");

  // 2. Efecto para CARGAR el carrito al entrar a la web
  useEffect(() => {
    // 1. Cargar el Carrito (Este sigue igual, está bien)
    const carritoGuardado = localStorage.getItem("carrito_kaori");
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error("Error al cargar el carrito local:", error);
      }
    }

    // 2. 📍 Cargar la Ubicación y Región (¡REVISADO!)
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
  const [cartOpen, setCartOpen] = useState(false);
  // Pon esto junto a tus otros useState (donde está carrito, productos, etc.)
  const [ubicacion, setUbicacion] = useState<any>(() => {
    if (typeof window !== "undefined") {
      // Retornamos el texto directamente, sin parsearlo
      return localStorage.getItem("ubicacion_kaori") || null;
    }
    return null;
  });
  const [loadingGps, setLoadingGps] = useState(false);
  const [regionNombre, setRegionNombre] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("region_kaori") || "";
    }
    return "";
  });
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
        const coordsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`; // URL corregida para que abra bien en celus

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

  // ─── CARGA DE PRODUCTOS DESDE SUPABASE ─── // NO QUITAR
  useEffect(() => {
    async function cargarProductos() {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .order("id", { ascending: false });

        if (error) throw error;

        setProductos(data || []);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarProductos();
  }, []);

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
  // ─── LÓGICA DE VITRINA PARA NOVEDADES ───
  const obtenerVitrinaNovedades = () => {
    // 1. Sacamos los nombres de todas las categorías que tienes
    const categorias = ["Tecno", "Electro", "PetShop", "Insumos", "Digital"];

    // 2. Para cada categoría, buscamos el primer producto (el más nuevo)
    const vitrina = categorias
      .map((cat) => {
        return productos.find((p) => p.categoria === cat);
      })
      .filter(Boolean); // Borramos si alguna categoría no tiene productos todavía

    // 3. Mezclamos el orden para que cada vez que refresquen cambie
    return vitrina.sort(() => Math.random() - 0.5);
  };

  const productosNovedades = obtenerVitrinaNovedades();
  // ─── LÓGICA DE PRODUCTOS ALEATORIOS PARA LOS PASILLOS ───
  const getAleatorios = (cat: string) => {
    return productos
      .filter((p) => p.categoria === cat)
      .sort(() => Math.random() - 0.5) // Se mezclan al refrescar
      .slice(0, 10); // Solo 10 para que sea ágil
  };

  const tecnoRandom = getAleatorios("Tecno");
  const electroRandom = getAleatorios("Electro");
  const petRandom = getAleatorios("PetShop");
  const insumosRandom = getAleatorios("Insumos");
  const pdfRandom = getAleatorios("PDF");
  const digitalRandom = getAleatorios("Digital");
  const outletRandom = getAleatorios("Outlet");
  // ─── MANEJO DEL MODAL DE DETALLE Y HISTORIAL ─── // NO QUITAR
  // Sirve para que el celular crea que "entraste" a otra página y habilite el botón de volver. // NO QUITAR
  const abrirProducto = (p: any) => {
    setSel(p);
    window.history.pushState({ modalOpen: true }, "");
  };

  // Evita que el historial del navegador se llene de basura si cierras el modal manualmente. // NO QUITAR
  const cerrarProducto = () => {
    setSel(null);
    if (window.history.state?.modalOpen) window.history.back();
  };

  // ─── PANTALLA DE CARGA ─── // NO QUITAR
  if (loading)
    return (
      // FONDO DE CARGA CLARO: Sunset Cream
      <div className="min-h-screen bg-[#FFF8F1] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Efecto de resplandor de fondo */}
        <div className="absolute w-[300px] h-[300px] bg-[#F97316]/10 blur-[100px] rounded-full animate-pulse" />

        <div className="relative flex flex-col items-center">
          {/* Loader con diseño de diamante moderno */}
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-[#F97316]/20 rounded-2xl rotate-45" />
            <div className="absolute inset-0 border-t-4 border-[#F97316] rounded-2xl rotate-45 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-bounce">⚡</span>
            </div>
          </div>

          {/* Nombre con estilo bloqueado (no traducible) */}
          <h1
            translate="no"
            className="text-4xl font-black italic tracking-tighter uppercase leading-none text-[#1F2937]"
          >
            KAORI
            <span className="text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]">
              STORE
            </span>
          </h1>

          {/* Barra de progreso minimalista */}
          <div className="w-32 h-1 bg-gray-200 mt-6 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        </div>

        <style jsx>{`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );

  return (
    // ─── EL FONDO ES SUNSET CREAM (#FFF8F1) - CLARO Y ENÉRGICO ─── // NO QUITAR
    <div className="min-h-screen bg-[#FFF8F1] text-[#1F2937] font-sans pb-40 overflow-x-hidden">
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

                {/* WHATSAPP SOPORTE */}
                <a
                  href="https://wa.me/59174244882"
                  target="_blank"
                  className="flex items-center justify-between p-5 bg-[#22c55e] rounded-[2.2rem] text-white shadow-[0_15px_30px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── HEADER (SOLIDEZ Y ENERGÍA) ─── */}
      <div className="p-4 flex justify-between items-center bg-white/95 backdrop-blur-xl sticky top-0 z-40 border-b border-[#F97316]/10 shadow-sm">
        <div className="flex flex-col">
          <Link href="/admin" className="group flex items-center gap-2">
            {/* Mini Emblema K: Para que no sea solo texto aburrido */}
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)] group-hover:rotate-6 transition-transform">
              <span className="text-white text-xl font-black italic">K</span>
            </div>

            <div className="flex flex-col">
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
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[#1F2937] shadow-sm active:scale-90 transition-transform"
          >
            ☰
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-12 h-12 bg-white rounded-2xl border border-orange-100 text-[#1F2937] shadow-[0_4px_12px_rgba(249,115,22,0.08)] flex items-center justify-center active:scale-90 transition-all duration-300 group hover:border-orange-300"
          >
            {/* Icono con ligero movimiento al pasar el mouse */}
            <span className="text-xl group-hover:rotate-12 transition-transform duration-300">
              🛒
            </span>

            {/* Badge de cantidad (El punto rojo) mejorado */}
            <AnimatePresence>
              {carrito.length > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-[1000] border-2 border-white shadow-md shadow-orange-200"
                >
                  {carrito.length}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Efecto de brillo sutil en el borde cuando hay productos */}
            {carrito.length > 0 && (
              <span className="absolute inset-0 rounded-2xl border-2 border-orange-400/20 animate-pulse pointer-events-none" />
            )}
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
      <div className="flex gap-3 overflow-x-auto px-4 py-8 no-scrollbar scroll-smooth">
        {categoriasConfig.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaSel(cat.id);
              setSoloOfertas(false);
            }}
            className={`px-7 py-3.5 rounded-full text-[10px] font-black uppercase transition-all flex-shrink-0 border shadow-sm ${
              categoriaSel === cat.id && !soloOfertas
                ? "bg-[#F97316] border-transparent text-white scale-105 shadow-orange-500/20"
                : "bg-white border-gray-100 text-gray-600 hover:border-[#F97316]/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── LISTADO (ALTO CONTRASTE) ─── */}
      <div className="px-5 flex justify-between items-end mb-8">
        <div>
          <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.3em] mb-1">
            Lo más reciente
          </p>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#1F2937] leading-none">
            {soloOfertas
              ? "Super Ofertas"
              : categoriaSel === "Todo"
                ? "Novedades"
                : categoriasConfig.find((c) => c.id === categoriaSel)?.label}
          </h2>
        </div>
        <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
          {productosFiltrados.length} Productos
        </div>
      </div>
      <AnimatePresence>
        {categoriaSel === "Tecno" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 mb-6 flex gap-2 overflow-x-auto no-scrollbar"
          >
            <button
              onClick={() => setSubCategoriaSel("Todas")}
              className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase transition-all flex-shrink-0 border ${
                subCategoriaSel === "Todas"
                  ? "bg-[#1F2937] border-transparent text-white shadow-lg"
                  : "bg-white border-gray-100 text-gray-400"
              }`}
            >
              Todo
            </button>

            {subCategorias["Tecno"].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSubCategoriaSel(sub.id)}
                className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase transition-all flex-shrink-0 border ${
                  subCategoriaSel === sub.id
                    ? "bg-[#F97316] border-transparent text-white shadow-lg"
                    : "bg-white border-gray-100 text-gray-400"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCTOS */}
      {/* ─── PASILLOS INTELIGENTES DE KAORI STORE ─── */}
      <div className="pb-32">
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
              subtitulo="Electrodomésticos Pro"
              items={electroRandom}
              abrirProducto={abrirProducto}
              tiempo={6000}
            />
            {/* 3. PASILLO TECNOLOGÍA */}
            <CarruselSeccion
              titulo="Tecnología"
              subtitulo="Gamer & Accesorios"
              items={tecnoRandom}
              abrirProducto={abrirProducto}
              tiempo={9500}
            />

            {/* 4. PASILLO MASCOTAS */}
            <CarruselSeccion
              titulo="Mascotas"
              subtitulo="Pet Shop & Care"
              items={petRandom}
              abrirProducto={abrirProducto}
              tiempo={7200}
            />

            {/* 5. PASILLO INSUMOS MÉDICOS */}
            <CarruselSeccion
              titulo="Salud"
              subtitulo="Insumos Médicos"
              items={insumosRandom}
              abrirProducto={abrirProducto}
              tiempo={11000}
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
            />

            {/* 6. PASILLO DIGITAL */}
            <CarruselSeccion
              titulo="Juegos y Licencias"
              subtitulo="Entretenimiento Digital"
              items={digitalRandom}
              abrirProducto={abrirProducto}
            />

            {/* 7. PASILLO PDFs */}
            <CarruselSeccion
              titulo="Lectura"
              subtitulo="Libros y PDFs"
              items={pdfRandom}
              abrirProducto={abrirProducto}
            />

            {/* 8. PASILLO OUTLET */}
            <CarruselSeccion
              titulo="Outlet"
              subtitulo="Ofertas Medio Uso"
              items={outletRandom}
              abrirProducto={abrirProducto}
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
                ubicacion={ubicacion}
                regionNombre={regionNombre}
                vincularGps={vincularGps}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── NAVBAR INFERIOR (MODERNO E IOS STYLE) ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 px-2 py-5 flex items-end justify-center z-50 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => {
            setCategoriaSel("Todo");
            setSoloOfertas(false);
            setBusqueda("");
            setBuscadorVisible(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${categoriaSel === "Todo" && !soloOfertas && !buscadorVisible ? "text-[#F97316] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Inicio
          </span>
        </button>

        <button
          onClick={() => {
            setSoloOfertas(true);
            setCategoriaSel("Todo");
            setBuscadorVisible(false);
          }}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${soloOfertas ? "text-[#EF4444] scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl relative flex items-center justify-center">
            🔥{" "}
            {productos.some((p) => p.descuento) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
            )}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Ofertas
          </span>
        </button>

        <button
          onClick={() => setMenuAbierto(true)}
          className="w-1/5 flex flex-col items-center justify-center relative active:scale-95 transition-transform"
        >
          <div className="bg-[#F97316] p-4.5 rounded-3xl -mt-14 shadow-[0_15px_30px_rgba(249,115,22,0.3)] border-4 border-white text-white flex items-center justify-center">
            <span className="text-3xl drop-shadow-md">⚡</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.1em] mt-3.5 text-[#F97316]">
            Explorar
          </span>
        </button>

        <button
          onClick={() => setBuscadorVisible(!buscadorVisible)}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 transition-all ${buscadorVisible ? "text-[#F97316] scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]" : "text-gray-400"}`}
        >
          <span className="text-2xl">🔍</span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
            Buscar
          </span>
        </button>

        <button
          onClick={() => setCartOpen(true)}
          className={`w-1/5 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all duration-300 ${
            cartOpen ? "text-[#F97316] scale-110" : "text-gray-400"
          }`}
        >
          <span className="text-2xl relative flex items-center justify-center">
            🛒
            <AnimatePresence>
              {carrito.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm"
                >
                  {carrito.length}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">
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
