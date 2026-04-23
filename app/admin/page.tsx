"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const AdminDashboard = dynamic(() => import("../components/AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black italic">
      CARGANDO EL REINO DE KAORI... 🔥
    </div>
  ),
});

// Componente para la LLUVIA EXAGERADA de unicornios y arcoíris
const LluviaDePonis = () => {
  const elementos = ["🦄", "🌈", "✨", "🦄", "🌈"];
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(100)].map(
        (
          _,
          i, // Bajamos a 25, es el número perfecto para que no se trabe
        ) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: `${Math.random() * 100}%` }}
            animate={{ y: "110vh" }}
            transition={{
              duration: Math.random() * 5 + 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
            className="absolute text-2xl select-none"
            style={{
              left: `${Math.random() * 100}%`,
              willChange: "transform", // 👈 ESTO ES MAGIA: le dice al navegador que use la tarjeta de video
            }}
          >
            {elementos[i % elementos.length]}
          </motion.div>
        ),
      )}
    </div>
  );
};

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkPass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pass.toLowerCase().trim() === "james") {
      // 2. HACEMOS EL LOGIN REAL EN SUPABASE
      // Usa el correo y la contraseña que creaste en el paso 1
      const { error } = await supabase.auth.signInWithPassword({
        email: "sarabiabrayam72@gmail.com",
        password: "JOSEmetal123",
      });

      if (error) {
        alert("Error de conexión con el reino: " + error.message);
      } else {
        setAutorizado(true);
      }
    } else {
      alert("Ese no es el nombre... concéntrate, 💀");
    }
  };

  if (!isMounted) return null;

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Lluvia de Ponis en el fondo */}
        <LluviaDePonis />

        {/* Card Estilo Rockero/Dark */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-[#0f0f0f] border-t-4 border-red-600 p-10 rounded-3xl shadow-[0_25px_50px_rgba(255,0,0,0.15)] text-center z-10 relative"
        >
          {/* Decoración lateral de fuego o calavera si quisieras */}
          <div className="text-4xl mb-6">🤘🔥</div>

          <h1 className="text-4xl font-[1000] italic tracking-tighter text-white mb-2 uppercase leading-none">
            KAORI <span className="text-red-600">ADMIN</span>
          </h1>

          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-10">
            Esta es nuestra tienda virtual.
          </p>

          <div className="bg-black/50 p-6 rounded-2xl border border-red-600/20 mb-8">
            <p className="text-gray-300 font-bold italic text-base leading-tight">
              Para ingresar debes contestar esta pregunta: <br />
              <span className="text-red-500 block mt-2 uppercase not-italic text-sm tracking-widest">
                ¿Como se llamaria tu hijo?
              </span>
            </p>
          </div>

          <form onSubmit={checkPass} className="space-y-4">
            <input
              type="text"
              placeholder="RESPUESTA..."
              className="w-full p-5 rounded-xl bg-black border border-white/10 outline-none text-center text-xl text-red-600 placeholder-gray-800 font-black transition-all focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-xl font-[1000] text-lg italic uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all"
            >
              INGRESAR AL PANEL
            </button>
          </form>
        </motion.div>

        {/* Viñeta roja en las esquinas para dar profundidad */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none shadow-[inset_0_0_150px_rgba(255,0,0,0.1)]" />
      </div>
    );
  }

  return <AdminDashboard />;
}
