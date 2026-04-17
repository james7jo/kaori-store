"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Cargamos el Dashboard solo en el cliente
const AdminDashboard = dynamic(() => import("../components/AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Cargando Panel de Kaori...
    </div>
  ),
});

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Esto asegura que solo ejecutamos hooks cuando el navegador está listo
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === "kaori2026") {
      setAutorizado(true);
    } else {
      alert("Clave incorrecta ❌");
    }
  };

  if (!isMounted) return null; // No renderizamos nada hasta que el cliente esté listo

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-5xl font-black italic tracking-tighter mb-10">
          KAORI ADMIN
        </h1>
        <form onSubmit={checkPass} className="w-full max-w-xs space-y-4">
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-5 rounded-3xl bg-white/10 border border-white/10 outline-none text-center text-xl"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-3xl font-black text-lg"
          >
            ENTRAR
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}
