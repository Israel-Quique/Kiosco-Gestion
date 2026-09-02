import React from 'react';
import { 
  X, 
  HelpCircle, 
  Truck, 
  Calculator, 
  Mail, 
  Headphones, 
  Scale, 
  Printer, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const guideItems = [
    {
      title: 'Rastreo de Envíos',
      desc: 'Consulte la ubicación y estado de su encomienda ingresando su código de guía.',
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-100',
    },
    {
      title: 'Calculadora Postal',
      desc: 'Cotice tarifas estimadas de envíos nacionales e internacionales según el peso y destino.',
      icon: <Calculator className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-100',
    },
    {
      title: 'Generar Preenvío',
      desc: 'Llene los datos de su envío con anticipación para agilizar la entrega en ventanilla.',
      icon: <Mail className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-100',
    },
    {
      title: 'Atención y Reclamos',
      desc: 'Registre consultas o quejas y reciba un código de seguimiento de atención.',
      icon: <Headphones className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-100',
    },
    {
      title: 'Declaración Aduanera',
      desc: 'Formulario digital para despachos y encomiendas que van fuera del país.',
      icon: <Scale className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-100',
    },
    {
      title: 'Sacar Turno / Ticket',
      desc: 'Presione el botón central amarillo para imprimir su ticket de atención en ventanilla.',
      icon: <Printer className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cb-blue-deep/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border-4 border-cb-yellow-main shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cb-blue-navy text-white border-b-2 border-cb-yellow-main">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cb-yellow-main text-cb-blue-navy">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-cb-yellow-bright">
                Guía de Uso del Kiosco Digital
              </h2>
              <p className="text-xs font-semibold text-white/80">
                Agencia Boliviana de Correos - Autoservicio Ciudadano
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guía en Cuadrícula */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
            {guideItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className={`p-2.5 rounded-xl ${item.bg} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xs font-black text-cb-blue-navy uppercase">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs font-semibold">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              Para regresar en cualquier momento, presione el botón <strong>Volver</strong> en la esquina superior derecha o solicite asistencia al personal en ventanilla.
            </span>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-cb-blue-navy text-cb-yellow-bright font-black uppercase text-xs hover:bg-cb-blue-royal transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Entendido, Volver al Kiosco</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

