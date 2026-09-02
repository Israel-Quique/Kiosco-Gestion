import React from 'react';
import { Hand, Sparkles } from 'lucide-react';

interface IdleAttractorProps {
  isVisible: boolean;
  onWakeUp: () => void;
}

export const IdleAttractor: React.FC<IdleAttractorProps> = ({ isVisible, onWakeUp }) => {
  if (!isVisible) return null;

  return (
    <div
      onClick={onWakeUp}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#fff08a] via-cb-yellow-main to-[#f59e0b] cursor-pointer animate-fadeIn select-none"
    >
      {/* Halo de luz de fondo */}
      <div className="absolute w-[80vw] h-[80vh] rounded-full bg-white/30 blur-3xl pointer-events-none" />

      {/* Contenido Central */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-2xl">
        <img
          src="/correos2.png"
          alt="Correos de Bolivia"
          className="h-28 w-auto object-contain drop-shadow-xl animate-pulse"
        />

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cb-blue-navy text-cb-yellow-bright text-xs font-black tracking-widest uppercase shadow-md">
          <Sparkles className="w-4 h-4" />
          <span>AGENCIA BOLIVIANA DE CORREOS</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-cb-blue-navy uppercase tracking-tight drop-shadow-md leading-tight">
          Toque la pantalla para comenzar
        </h1>

        <p className="text-lg font-bold text-cb-blue-royal max-w-lg">
          Acceda a rastreo de correspondencia, calculadora postal, preenvíos y turnos de ventanilla.
        </p>

        <div className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-cb-blue-navy text-cb-yellow-bright text-base font-black uppercase tracking-wider shadow-2xl animate-bounce-soft">
          <Hand className="w-6 h-6 animate-pulse" />
          <span>Tocar para Iniciar</span>
        </div>
      </div>
    </div>
  );
};

