// app/admin/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_PASSWORD = "kaoristore1@23#";
const MAX_INTENTOS = 4;
const BLOQUEO_SEG = 30;
const INACTIVIDAD_MS = 3 * 60 * 1000; // 3 minutos

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [autorizado, setAutorizado] = useState(false);
  const [pass, setPass] = useState("");
  const [estado, setEstado] = useState<
    "idle" | "loading" | "error" | "bloqueado"
  >("idle");
  const [intentos, setIntentos] = useState(0);
  const [mensajeError, setMensajeError] = useState("");
  const [tiempoBloqueo, setTiempoBloqueo] = useState(0);
  const [mostrarPass, setMostrarPass] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactividadRef = useRef<NodeJS.Timeout | null>(null);

  // ── Persistir sesión en sessionStorage (dura hasta cerrar pestaña) ──
  useEffect(() => {
    const sesion = sessionStorage.getItem("kaori_admin");
    if (sesion === "ok") setAutorizado(true);
    else setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  // ── Timer de inactividad — solo corre si está autorizado ──
  useEffect(() => {
    if (!autorizado) return;

    const reiniciar = () => {
      if (inactividadRef.current) clearTimeout(inactividadRef.current);
      inactividadRef.current = setTimeout(() => {
        sessionStorage.removeItem("kaori_admin");
        setAutorizado(false);
        setPass("");
        setEstado("idle");
      }, INACTIVIDAD_MS);
    };

    // Cualquier interacción reinicia el contador
    const eventos = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    eventos.forEach((e) => window.addEventListener(e, reiniciar));
    reiniciar(); // arrancar al montar

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
      if (inactividadRef.current) clearTimeout(inactividadRef.current);
    };
  }, [autorizado]);

  // ── Cuenta regresiva bloqueo ──
  useEffect(() => {
    if (estado !== "bloqueado") return;
    if (tiempoBloqueo <= 0) {
      setEstado("idle");
      setIntentos(0);
      setPass("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const t = setTimeout(() => setTiempoBloqueo((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [estado, tiempoBloqueo]);

  const checkPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pass.trim() || estado === "loading" || estado === "bloqueado") return;
    setEstado("loading");

    await new Promise((r) => setTimeout(r, 700));

    if (pass === ADMIN_PASSWORD) {
      const { error } = await supabase.auth.signInWithPassword({
        email: "sarabiabrayam72@gmail.com",
        password: "JOSEmetal123",
      });
      if (error) {
        setEstado("error");
        setMensajeError("Error de conexión.");
        setTimeout(() => setEstado("idle"), 2000);
      } else {
        sessionStorage.setItem("kaori_admin", "ok"); // ← guardar sesión
        setAutorizado(true);
      }
    } else {
      const nuevos = intentos + 1;
      setIntentos(nuevos);
      setPass("");
      if (nuevos >= MAX_INTENTOS) {
        setEstado("bloqueado");
        setTiempoBloqueo(BLOQUEO_SEG);
        setMensajeError("Demasiados intentos. Acceso bloqueado.");
      } else {
        setEstado("error");
        setMensajeError(
          `Clave incorrecta. ${MAX_INTENTOS - nuevos} intento${MAX_INTENTOS - nuevos !== 1 ? "s" : ""} restante${MAX_INTENTOS - nuevos !== 1 ? "s" : ""}.`,
        );
        setTimeout(() => {
          setEstado("idle");
          inputRef.current?.focus();
        }, 2000);
      }
    }
  };

  // ── LOGIN ──
  if (!autorizado) {
    const bloqueado = estado === "bloqueado";
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        {/* mismo fondo de grilla que tenías */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-[340px]"
        >
          {/* Header sistema */}
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  display: "inline-block",
                  background: bloqueado ? "#ef4444" : "#22c55e",
                  boxShadow: bloqueado ? "0 0 6px #ef4444" : "0 0 6px #22c55e",
                }}
              />
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{
                  color: bloqueado
                    ? "rgba(239,68,68,.6)"
                    : "rgba(255,255,255,.18)",
                }}
              >
                {bloqueado ? "BLOQUEADO" : "SISTEMA ACTIVO"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/10">
              KRS-ADM v2.1
            </span>
          </div>

          <motion.div
            animate={
              estado === "error" ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }
            }
            transition={{ duration: 0.4 }}
            className="bg-[#0b0b0b] rounded-2xl p-8"
            style={{
              border: `0.5px solid ${bloqueado ? "rgba(239,68,68,.3)" : "rgba(255,255,255,.07)"}`,
              boxShadow: "0 32px 64px rgba(0,0,0,.75)",
            }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-[13px] bg-orange-500/7 border border-orange-500/18 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="#F97316"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="#F97316" />
                </svg>
              </div>
              <div className="text-center">
                <h1
                  className="text-[19px] font-semibold text-white italic"
                  style={{
                    fontFamily: "Georgia,serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Acceso restringido
                </h1>
                <p className="text-[10px] text-white/18 uppercase tracking-[0.25em] mt-1.5">
                  Kaori Store · Panel Admin
                </p>
              </div>
            </div>

            <form onSubmit={checkPass} className="flex flex-col gap-3">
              <div className="relative">
                <label className="block text-[10px] text-white/22 uppercase tracking-[0.15em] mb-1.5">
                  Clave de acceso
                </label>
                <input
                  ref={inputRef}
                  type={mostrarPass ? "text" : "password"}
                  placeholder="••••••••••••••••"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    if (estado === "error") setEstado("idle");
                  }}
                  disabled={estado === "loading" || bloqueado}
                  className="w-full bg-black/55 rounded-[10px] px-3.5 py-3 text-white text-[14px] font-mono outline-none pr-10"
                  style={{
                    border: `0.5px solid ${estado === "error" ? "rgba(239,68,68,.5)" : bloqueado ? "rgba(239,68,68,.25)" : "rgba(255,255,255,.08)"}`,
                    caretColor: "#F97316",
                    letterSpacing: mostrarPass ? "0.04em" : "0.12em",
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setMostrarPass((v) => !v)}
                  className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-white/18"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {mostrarPass ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {(estado === "error" || bloqueado) && mensajeError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-mono"
                    style={{ color: "rgba(239,68,68,.75)" }}
                  >
                    {bloqueado
                      ? `${mensajeError} (${tiempoBloqueo}s)`
                      : mensajeError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={!pass.trim() || estado === "loading" || bloqueado}
                className="w-full py-3 rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.2em] transition-all mt-1"
                style={{
                  background:
                    bloqueado || estado === "error"
                      ? "rgba(239,68,68,.07)"
                      : "rgba(249,115,22,.88)",
                  color:
                    bloqueado || estado === "error"
                      ? "rgba(239,68,68,.55)"
                      : "#fff",
                  opacity: !pass.trim() ? 0.3 : 1,
                }}
              >
                {estado === "loading"
                  ? "Verificando..."
                  : bloqueado
                    ? `Bloqueado — ${tiempoBloqueo}s`
                    : "Autenticar"}
              </button>
            </form>

            {intentos > 0 && !bloqueado && (
              <div className="flex justify-center items-center gap-2 mt-5">
                <span className="text-[10px] text-white/13 font-mono">
                  Intentos
                </span>
                <div className="flex gap-1">
                  {[...Array(MAX_INTENTOS)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        display: "inline-block",
                        background:
                          i < intentos ? "#ef4444" : "rgba(255,255,255,.08)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <p className="text-center text-[10px] font-mono text-white/6 mt-5 uppercase tracking-widest">
            © {new Date().getFullYear()} Kaori Store — Acceso privado
          </p>
        </motion.div>
      </div>
    );
  }

  // ── PANEL — ya autorizado ──
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[9px] bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-black text-[11px]">K</span>
            </div>
            <span className="font-black italic text-[15px] bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent uppercase">
              Kaori
            </span>
          </div>

          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-[11px] p-[3px]">
            {[
              { href: "/admin", label: "Inventario" },
              { href: "/admin/pedidos", label: "Pedidos" },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-[8px] text-[9px] font-black uppercase tracking-wide transition-all ${
                  path === tab.href
                    ? "bg-[#f97316] text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[9px] font-black uppercase text-gray-600 border border-white/[0.08] px-2.5 py-1.5 rounded-[9px] hover:text-white transition"
            >
              ← Tienda
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("kaori_admin");
                setAutorizado(false);
                setPass("");
              }}
              className="text-[9px] font-black uppercase text-red-500/50 hover:text-red-400 transition"
              title="Cerrar sesión"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
