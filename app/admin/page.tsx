"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const AdminDashboard = dynamic(() => import("../components/AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white/20 text-[11px] uppercase tracking-[0.4em]">
        Iniciando sistema...
      </p>
    </div>
  ),
});

// ── Contraseña segura ─────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "kaoristore1@23#";
const MAX_INTENTOS = 4;
const SEGUNDOS_BLOQUEO = 30;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Estado = "idle" | "loading" | "error" | "success" | "bloqueado";

// ── Fondo: grilla + scan line ─────────────────────────────────────────────────
function Fondo() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      <motion.div
        className="fixed left-0 right-0 z-0 pointer-events-none"
        style={{ height: 1, background: "rgba(249,115,22,0.06)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}

// ── Dot de intento fallido ────────────────────────────────────────────────────
function IntentosDot({ lleno }: { lleno: boolean }) {
  return (
    <motion.span
      animate={lleno ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: lleno ? "#ef4444" : "rgba(255,255,255,0.08)",
        border: "0.5px solid rgba(255,255,255,0.12)",
        boxShadow: lleno ? "0 0 5px rgba(239,68,68,0.5)" : "none",
        transition: "all 0.3s",
      }}
    />
  );
}

// ── Puntitos de carga ─────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "currentColor",
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [estado, setEstado] = useState<Estado>("idle");
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [tiempoBloqueo, setTiempoBloqueo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => inputRef.current?.focus(), 700);
  }, []);

  // Cuenta regresiva de bloqueo
  useEffect(() => {
    if (estado !== "bloqueado") return;
    if (tiempoBloqueo <= 0) {
      setEstado("idle");
      setIntentosFallidos(0);
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
    setMensajeError("");

    // Delay artificial — se ve más sistema real
    await new Promise((r) => setTimeout(r, 900));

    if (pass === ADMIN_PASSWORD) {
      const { error } = await supabase.auth.signInWithPassword({
        email: "sarabiabrayam72@gmail.com",
        password: "JOSEmetal123",
      });

      if (error) {
        setEstado("error");
        setMensajeError("Error de conexión con el servidor.");
        setTimeout(() => setEstado("idle"), 2000);
      } else {
        setEstado("success");
        setTimeout(() => setAutorizado(true), 900);
      }
    } else {
      const nuevos = intentosFallidos + 1;
      setIntentosFallidos(nuevos);
      setPass("");

      if (nuevos >= MAX_INTENTOS) {
        setEstado("bloqueado");
        setTiempoBloqueo(SEGUNDOS_BLOQUEO);
        setMensajeError("Demasiados intentos fallidos. Acceso bloqueado.");
      } else {
        setEstado("error");
        const restantes = MAX_INTENTOS - nuevos;
        setMensajeError(
          `Credencial incorrecta. ${restantes} intento${restantes !== 1 ? "s" : ""} restante${restantes !== 1 ? "s" : ""}.`,
        );
        setTimeout(() => {
          setEstado("idle");
          inputRef.current?.focus();
        }, 2000);
      }
    }
  };

  if (!isMounted) return null;
  if (autorizado) return <AdminDashboard />;

  const bloqueado = estado === "bloqueado";
  const borderColor = bloqueado
    ? "rgba(239,68,68,0.3)"
    : estado === "success"
      ? "rgba(34,197,94,0.3)"
      : "rgba(255,255,255,0.07)";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <Fondo />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[360px]"
      >
        {/* Header de sistema */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <motion.span
              animate={bloqueado ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: bloqueado ? "#ef4444" : "#22c55e",
                boxShadow: bloqueado ? "0 0 6px #ef4444" : "0 0 6px #22c55e",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: bloqueado
                  ? "rgba(239,68,68,0.6)"
                  : "rgba(255,255,255,0.18)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              {bloqueado ? "BLOQUEADO" : "SISTEMA ACTIVO"}
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.1)",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
            }}
          >
            KRS-ADM v2.1
          </span>
        </div>

        {/* Card */}
        <motion.div
          animate={
            estado === "error" ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }
          }
          transition={{ duration: 0.4 }}
          style={{
            background: "rgba(11,11,11,0.98)",
            border: `0.5px solid ${borderColor}`,
            borderRadius: 16,
            padding: "36px 32px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.75)",
            transition: "border-color 0.4s",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 13,
                background: "rgba(249,115,22,0.07)",
                border: "0.5px solid rgba(249,115,22,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Georgia', serif",
                  fontStyle: "italic",
                  lineHeight: 1,
                }}
              >
                Acceso restringido
              </h1>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.18)",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  marginTop: 7,
                }}
              >
                Kaori Store · Panel Admin
              </p>
            </div>
          </div>

          {/* Aviso */}
          <div
            style={{
              background: "rgba(249,115,22,0.04)",
              border: "0.5px solid rgba(249,115,22,0.1)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 24,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginTop: 1, flexShrink: 0 }}
            >
              <path
                d="M12 9v4M12 17h.01"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="#F97316"
                strokeWidth="1.5"
              />
            </svg>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.28)",
                lineHeight: 1.55,
              }}
            >
              Área de acceso exclusivo. Los intentos de acceso no autorizados
              quedan registrados.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={checkPass} className="flex flex-col gap-3">
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.22)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
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
                disabled={
                  estado === "loading" || estado === "success" || bloqueado
                }
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 14px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.55)",
                  border: `0.5px solid ${
                    estado === "error"
                      ? "rgba(239,68,68,0.5)"
                      : estado === "success"
                        ? "rgba(34,197,94,0.5)"
                        : bloqueado
                          ? "rgba(239,68,68,0.25)"
                          : "rgba(255,255,255,0.08)"
                  }`,
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  letterSpacing: mostrarPass ? "0.04em" : "0.12em",
                  fontFamily: "monospace",
                  caretColor: "#F97316",
                  transition: "border-color 0.2s",
                }}
              />
              {/* Mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setMostrarPass((v) => !v)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "calc(50% + 10px)",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  color: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {mostrarPass ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mensaje error */}
            <AnimatePresence>
              {(estado === "error" || bloqueado) && mensajeError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 11,
                    color: "rgba(239,68,68,0.75)",
                    letterSpacing: "0.02em",
                    fontFamily: "monospace",
                  }}
                >
                  {bloqueado
                    ? `${mensajeError} (${tiempoBloqueo}s)`
                    : mensajeError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Botón */}
            <motion.button
              type="submit"
              whileTap={!bloqueado ? { scale: 0.98 } : {}}
              disabled={
                !pass.trim() ||
                estado === "loading" ||
                estado === "success" ||
                bloqueado
              }
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                border: "none",
                marginTop: 4,
                cursor:
                  pass.trim() && estado === "idle" ? "pointer" : "not-allowed",
                background:
                  estado === "success"
                    ? "rgba(34,197,94,0.1)"
                    : bloqueado || estado === "error"
                      ? "rgba(239,68,68,0.07)"
                      : "rgba(249,115,22,0.88)",
                color:
                  estado === "success"
                    ? "rgb(134,239,172)"
                    : bloqueado || estado === "error"
                      ? "rgba(239,68,68,0.55)"
                      : "#fff",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                transition: "all 0.3s",
                opacity: !pass.trim() && estado === "idle" ? 0.3 : 1,
              }}
            >
              {estado === "loading" ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <LoadingDots />
                  Verificando
                </span>
              ) : estado === "success" ? (
                "✓ Acceso concedido"
              ) : bloqueado ? (
                `Bloqueado — ${tiempoBloqueo}s`
              ) : (
                "Autenticar"
              )}
            </motion.button>
          </form>

          {/* Indicador de intentos fallidos */}
          <AnimatePresence>
            {intentosFallidos > 0 && !bloqueado && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 mt-5"
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.13)",
                    fontFamily: "monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  Intentos
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[...Array(MAX_INTENTOS)].map((_, i) => (
                    <IntentosDot key={i} lleno={i < intentosFallidos} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "rgba(255,255,255,0.06)",
            marginTop: 20,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          © {new Date().getFullYear()} Kaori Store — Acceso privado
        </p>
      </motion.div>
    </div>
  );
}
