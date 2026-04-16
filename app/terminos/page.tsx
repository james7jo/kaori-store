"use client";
import React from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function TerminosPage() {
  const [cargando, setCargando] = React.useState(false);

  const celebrarYVolver = () => {
    setCargando(true); // 👈 Activamos el texto de redirigiendo

    const end = Date.now() + 3 * 1000;
    const colors = [
      "#ff0000",
      "#ffa500",
      "#ffff00",
      "#008000",
      "#0000ff",
      "#4b0082",
      "#ee82ee",
    ];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden border border-slate-100">
        {/* HEADER KAORI STYLE */}
        <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 text-[150px] font-black italic -mr-10 -mt-10 select-none">
            T&C
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-8"
          >
            ← Volver a la tienda
          </Link>
          <h1 className="text-4xl md:text-5xl font-[1000] italic uppercase leading-none tracking-tighter">
            Términos y <br />
            Condiciones
          </h1>
          <p className="mt-4 text-orange-100 font-bold uppercase text-xs tracking-[0.2em]">
            Venta y Entrega • Kaori Store Bolivia
          </p>
        </div>

        <div className="p-8 md:p-16 space-y-12">
          {/* ADVERTENCIA LEGAL */}
          <section className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem]">
            <h2 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>⚠️</span> Advertencia Legal Prominente
            </h2>
            <p className="text-[13px] text-red-800 leading-relaxed font-medium italic">
              Este documento constituye un acuerdo legal entre el usuario y
              Kaori Store. Se recomienda leerlo detenidamente. Kaori Store
              enfatiza la importancia de comprender las limitaciones de garantía
              para los envíos sin número de seguimiento (tracking number) en la
              Sección 4.3. Este documento no reemplaza el asesoramiento legal
              especializado.
            </p>
          </section>

          {/* 1. INTRODUCCIÓN */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-orange-100 text-[#F97316] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic">
                01
              </span>
              <h2 className="text-xl font-[1000] italic uppercase text-slate-800 tracking-tight">
                Introducción
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              El presente documento establece las reglas de uso y venta de
              **Kaori Store**, con sede en Cochabamba, Bolivia. Al realizar una
              compra, usted acepta estas condiciones de manera íntegra.
            </p>
          </section>

          {/* 2. ASPECTOS GENERALES */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-3">
                Pagos
              </h3>
              <p className="text-sm font-bold text-slate-700">
                Aceptamos QR (Pago Simple), Tigo Money y Transferencias. El pago
                por QR es inmediato y asegura la disponibilidad del stock.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-3">
                Privacidad
              </h3>
              <p className="text-sm font-bold text-slate-700">
                Sus datos se manejan conforme a la Ley 164 de Bolivia (Art.
                108), garantizando total confidencialidad.
              </p>
            </div>
          </section>

          {/* 3. POLÍTICA DE ENVÍOS (CRÍTICO) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange-100 text-[#F97316] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic">
                03
              </span>
              <h2 className="text-xl font-[1000] italic uppercase text-slate-800 tracking-tight">
                Política de Envíos y Entregas
              </h2>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-slate-50 p-6 rounded-[2rem]">
                <h4 className="text-[#F97316] font-[1000] italic uppercase text-sm mb-2">
                  A. Modalidad con Seguimiento (Courier Formal)
                </h4>
                <p className="text-sm text-slate-600 font-medium">
                  Aplicable a ciudades principales. Se entrega un{" "}
                  <b>Tracking Number</b>. El cliente tiene 72h para recoger el
                  paquete tras la notificación de llegada.
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-[2rem]">
                <h4 className="text-orange-700 font-[1000] italic uppercase text-sm mb-2">
                  B. Envíos a Provincias (Transporte Informal)
                </h4>
                <p className="text-sm text-orange-900 font-bold mb-3 italic">
                  ⚠️ CLÁUSULA DE RIESGO:
                </p>
                <p className="text-sm text-orange-800 font-medium">
                  En envíos vía flotas o transportistas sin tracking confiable,
                  el cliente asume el riesgo total del trayecto.{" "}
                  <b>La garantía de reembolso por no recepción queda ANULADA</b>{" "}
                  bajo esta modalidad. Kaori Store cumple su obligación al
                  entregar el paquete y la hoja de ruta al transportista.
                </p>
              </div>
            </div>
          </section>

          {/* 4. REEMBOLSOS */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-orange-100 text-[#F97316] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm italic">
                04
              </span>
              <h2 className="text-xl font-[1000] italic uppercase text-slate-800 tracking-tight">
                Reembolsos y Devoluciones
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="text-orange-500 mt-1">✔</span>
                <p className="text-sm text-slate-600 font-medium">
                  <span className="font-black text-slate-800 uppercase italic text-[11px] mr-2">
                    No Recepción (72h):
                  </span>{" "}
                  Solo aplica a envíos con tracking formal. Reembolso total si
                  el tracking no registra entrega.
                </p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-orange-500 mt-1">✔</span>
                <p className="text-sm text-slate-600 font-medium">
                  <span className="font-black text-slate-800 uppercase italic text-[11px] mr-2">
                    Daños de Fábrica:
                  </span>{" "}
                  Notificar en menos de 24h con video 'unboxing'. Tras
                  validación, se procede al cambio o reembolso.
                </p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-red-600 p-6 rounded-[2rem] text-white w-full shadow-lg shadow-red-900/20">
                  <h4 className="font-black uppercase text-[10px] tracking-widest mb-2 text-red-200">
                    🚨 CLÁUSULA DE ABANDONO (ESTRICTO)
                  </h4>
                  <p className="text-sm font-bold leading-relaxed">
                    Pasadas las **72 horas** desde que el sistema de tracking
                    confirme la llegada del producto a su destino, si el cliente
                    no ha recogido el paquete, se procederá a la **DEVOLUCIÓN
                    AUTOMÁTICA** del producto a nuestro origen. En este caso,
                    **NO SE REALIZARÁ NINGÚN REEMBOLSO** ni devoluciones de
                    dinero.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* FOOTER POLÍTICAS */}
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              © {new Date().getFullYear()} Kaori Store • Bolivia
            </p>
            <div className="relative group">
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#F97316] opacity-0 group-hover:opacity-100 transition-all uppercase italic whitespace-nowrap">
                ✨ ¡Gracias por confiar en Kaori Store! ✨
              </span>
              <button
                onClick={celebrarYVolver}
                disabled={cargando}
                className={`text-[10px] font-[1000] uppercase italic px-10 py-4 rounded-full transition-all active:scale-95 shadow-sm flex items-center gap-2 ${
                  cargando
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white"
                }`}
              >
                {cargando ? (
                  <>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                    Redirigiendo...
                  </>
                ) : (
                  "Acepto y deseo comprar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
