import React, { useState } from 'react';
import { RotateCw, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { ServiceItem } from '../../types/index.js';

interface EmbeddedServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

export const EmbeddedServiceModal: React.FC<EmbeddedServiceModalProps> = ({ service, onClose }) => {
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!service) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cb-blue-deep/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col bg-cb-blue-navy rounded-3xl border-4 border-cb-yellow-main shadow-2xl overflow-hidden">
        
        {/* Header de la Ventana Embebida */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-[#071930] to-[#0b2545] border-b-2 border-cb-yellow-main">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cb-yellow-main text-cb-blue-navy">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cb-yellow-bright px-2 py-0.5 bg-white/10 rounded-full">
                  SERVICIO OFICIAL
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexión Segura
                </span>
              </div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                {service.title}
              </h2>
            </div>
          </div>

          {/* Botones de Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              title="Recargar página"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-cb-yellow-main hover:text-cb-blue-deep text-white text-xs font-extrabold transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Recargar</span>
            </button>

            <button
              onClick={onClose}
              title="Cerrar y volver al inicio"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Kiosco</span>
            </button>
          </div>
        </div>

        {/* Iframe con Loader */}
        <div className="relative flex-1 bg-white overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <Loader2 className="w-10 h-10 text-cb-blue-navy animate-spin mb-3" />
              <p className="text-sm font-black text-cb-blue-navy uppercase tracking-wider">
                Cargando {service.name}...
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Conectando con el servidor de Correos de Bolivia
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={service.url}
            title={service.title}
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            allow="fullscreen; payment"
          />
        </div>

      </div>
    </div>
  );
};

