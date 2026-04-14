"use client";
import { useState } from "react";
// Aquí está el cambio: subimos un nivel para entrar a components
import AdminDashboard from "../components/AdminDashboard"; 

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  const checkPass = (e: any) => {
    e.preventDefault();
    if (pass === "kaori2026") {
      setAutorizado(true);
    } else {
      alert("Clave incorrecta ❌");
    }
  };

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-5xl font-black italic tracking-tighter mb-10">KAORI ADMIN</h1>
        <form onSubmit={checkPass} className="w-full max-w-xs space-y-4">
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-5 rounded-3xl bg-white/10 border border-white/10 outline-none text-center text-xl"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button className="w-full bg-white text-black py-5 rounded-3xl font-black text-lg">
            ENTRAR
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}