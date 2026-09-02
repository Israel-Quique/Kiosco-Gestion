import React from 'react';
import { 
  Truck, 
  Calculator, 
  Mail, 
  Headphones, 
  Scale, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ServiceItem } from '../../types/index.js';

interface ServiceCardProps {
  service: ServiceItem;
  onSelect: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  // Mapeo de icono Lucide
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'local_shipping': return <Truck className="w-4 h-4" />;
      case 'calculate': return <Calculator className="w-4 h-4" />;
      case 'markunread_mailbox': return <Mail className="w-4 h-4" />;
      case 'support_agent': return <Headphones className="w-4 h-4" />;
      case 'gavel': return <Scale className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  // Color de badge y borde según tema
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'tracking':
        return {
          badge: 'bg-sky-100 text-sky-700 border-sky-300',
          topBar: 'bg-sky-500',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(2,132,199,0.35)]',
        };
      case 'calculator':
        return {
          badge: 'bg-blue-100 text-blue-700 border-blue-300',
          topBar: 'bg-blue-600',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(37,99,235,0.35)]',
        };
      case 'preshipment':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-300',
          topBar: 'bg-amber-500',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(217,119,6,0.35)]',
        };
      case 'claims':
        return {
          badge: 'bg-rose-100 text-rose-700 border-rose-300',
          topBar: 'bg-rose-500',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(225,29,72,0.35)]',
        };
      case 'customs':
        return {
          badge: 'bg-purple-100 text-purple-700 border-purple-300',
          topBar: 'bg-purple-600',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(124,58,237,0.35)]',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-300',
          topBar: 'bg-slate-500',
          glow: 'group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.2)]',
        };
    }
  };

  const themeStyle = getThemeStyles(service.colorTheme);

  return (
    <article
      onClick={() => onSelect(service)}
      tabIndex={0}
      className={`group relative flex flex-col justify-between p-4 bg-gradient-to-b from-white to-[#fffdf5] rounded-3xl border-[2.5px] border-cb-blue-navy shadow-[0_12px_28px_rgba(11,37,69,0.14)] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-cb-blue-navy active:scale-[0.98] ${themeStyle.glow}`}
    >
      {/* Barra superior de color */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${themeStyle.topBar}`} />

      {/* 1. Header de la Tarjeta */}
      <div className="flex items-center justify-between mt-1 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${themeStyle.badge}`}>
          {getIcon(service.icon)}
          <span>{service.name}</span>
        </span>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
        </span>
      </div>

      {/* 2. Cuerpo con Ilustración y Textos */}
      <div className="flex flex-col items-center text-center flex-1 py-1">
        <div className="w-full h-32 flex items-center justify-center mb-2 p-1 bg-white rounded-2xl">
          <img
            src={service.imageUrl}
            alt={service.title}
            className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <h3 className="text-base font-black text-cb-blue-navy leading-tight uppercase tracking-tight mb-1">
          {service.title}
        </h3>
        <p className="text-xs font-semibold text-cb-blue-navy/70 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* 3. Botón de Acción Táctil */}
      <div className="mt-3">
        <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-cb-blue-navy text-white text-xs font-extrabold uppercase tracking-wider transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-cb-yellow-bright group-hover:to-cb-yellow-main group-hover:text-cb-blue-deep group-hover:shadow-[0_4px_14px_rgba(255,204,0,0.5)]">
          <span>Ingresar</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
};

