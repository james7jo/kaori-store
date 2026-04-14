"use client";
import { motion } from "framer-motion";

export default function TarjetaProducto({ producto, onClick }: { producto: any, onClick: () => void }) {
  return (
    <motion.div 
      onClick={onClick} 
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] rounded-[2rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl group relative"
    >
      {/* Contenedor de Imagen */}
      <div className="aspect-square relative bg-black overflow-hidden">
        <img 
          src={producto.imagen} 
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" 
          alt={producto.nombre} 
        />
        
        {/* Badge de Descuento Estilo Neón */}
        {producto.descuento && (
          <div className="absolute top-3 left-3 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] px-2.5 py-1 rounded-lg">
            <p className="text-[10px] font-black text-white italic">
              -{producto.descuento}
            </p>
          </div>
        )}

        {/* Indicador de Stock sutil */}
        {producto.stock <= 3 && producto.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-orange-600/20 backdrop-blur-md border border-orange-500/30 px-2 py-0.5 rounded-md">
            <p className="text-[8px] font-black text-orange-500 uppercase">¡Pocas unidades!</p>
          </div>
        )}
      </div>

      {/* Info del Producto */}
      <div className="p-4 bg-gradient-to-b from-[#181818] to-[#121212]">
        <div className="flex items-baseline gap-1">
          <span className="text-orange-500 text-[10px] font-black italic">Bs</span>
          <span className="text-2xl font-black italic tracking-tighter text-white">
            {producto.precio}
          </span>
        </div>
        
        <p className="text-[12px] text-gray-400 leading-tight mt-2 line-clamp-2 h-9 font-bold italic uppercase tracking-tight group-hover:text-orange-400 transition-colors">
          {producto.nombre}
        </p>
      </div>

      {/* Brillo decorativo al hover */}
      <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/10 rounded-[2rem] transition-all pointer-events-none"></div>
    </motion.div>
  );
}