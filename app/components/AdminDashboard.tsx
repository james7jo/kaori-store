"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [productos, setProductos] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", desc: "", vendidos: "" });
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    // IMPORTANTE: Aquí también corregimos los nombres de las columnas si fuera necesario, 
    // pero select('*') trae todo automáticamente.
    const { data } = await supabase.from('productos').select('*').order('id', { ascending: false });
    setProductos(data || []);
  }

  async function subirProducto(e: any) {
    e.preventDefault();
    if (!imagenFile) return alert("¡Saca una foto primero!");
    setLoading(true);

    try {
      // 1. Subir la imagen al Storage
      const fileExt = imagenFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos-productos')
        .upload(filePath, imagenFile);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública de esa foto
      const { data: urlData } = supabase.storage
        .from('fotos-productos')
        .getPublicUrl(filePath);

      // 3. Guardar en la base de datos (USANDO LOS NOMBRES CORREGIDOS)
      const { error: dbError } = await supabase.from('productos').insert([{
        nombre: nuevo.nombre,
        precio: nuevo.precio,
        descripcion: nuevo.desc, // 'desc' del formulario va a 'descripcion' en SQL
        imagen: urlData.publicUrl, // 'img' del código va a 'imagen' en SQL
        vendidos: nuevo.vendidos
      }]);

      if (dbError) throw dbError;

      setNuevo({ nombre: "", precio: "", desc: "", vendidos: "" });
      setImagenFile(null);
      cargar();
      alert("✅ ¡Publicado en la tienda!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-3xl font-black italic mb-6 tracking-tighter">KAORI ADMIN</h1>

        {/* FORMULARIO DE SUBIDA */}
        <form onSubmit={subirProducto} className="bg-white p-6 rounded-[2rem] shadow-xl space-y-4 mb-10">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-gray-50">
            {imagenFile ? (
              <img src={URL.createObjectURL(imagenFile)} className="w-40 h-40 object-cover rounded-2xl shadow-md" />
            ) : (
              <span className="text-4xl">📸</span>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="mt-4 text-xs" 
              onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
            />
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">Saca foto de los productos</p>
          </div>

          <input type="text" placeholder="Nombre" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Precio Bs" className="p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} required />
            <input type="text" placeholder="Vendidos" className="p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100" value={nuevo.vendidos} onChange={e => setNuevo({...nuevo, vendidos: e.target.value})} />
          </div>
          <textarea placeholder="Descripción técnica" className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 h-24" value={nuevo.desc} onChange={e => setNuevo({...nuevo, desc: e.target.value})} required />
          
          <button disabled={loading} className="w-full bg-black text-white py-5 rounded-full font-black text-xl active:scale-95 transition-all shadow-lg">
            {loading ? "SUBIENDO..." : "SUBIR A LA TIENDA"}
          </button>
        </form>

        {/* VISTA PREVIA DEL INVENTARIO */}
        <h2 className="font-black text-gray-400 text-xs uppercase tracking-widest mb-4 ml-4 italic">Tu Inventario</h2>
        <div className="space-y-3">
          {productos.map(p => (
            <div key={p.id} className="bg-white p-3 rounded-[1.5rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                {/* Aquí usamos p.imagen porque así se llama en la base de datos ahora */}
                <img src={p.imagen} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-sm leading-tight">{p.nombre}</p>
                  <p className="text-red-600 font-black text-xs">Bs {p.precio}</p>
                </div>
              </div>
              <button onClick={async () => { if(confirm("¿Borrar?")) { await supabase.from('productos').delete().eq('id', p.id); cargar(); } }} className="bg-red-50 text-red-500 p-3 rounded-xl font-bold text-xs">Borrar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}