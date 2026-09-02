import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Clock, 
  Package, 
  CreditCard, 
  Headphones, 
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api.js';
import { TicketItem } from '../../types/index.js';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTicket, setGeneratedTicket] = useState<TicketItem | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'GENERAL', label: 'Ventanilla General', desc: 'Atención general, consultas y envíos simples', icon: <Package className="w-6 h-6" />, color: 'bg-blue-600' },
    { id: 'ENCOMIENDAS', label: 'Encomiendas y Paquetería', desc: 'Recepción y retiro de paquetes nacionales e internacionales', icon: <Package className="w-6 h-6" />, color: 'bg-amber-600' },
    { id: 'CAJAS', label: 'Cajas y Pagos', desc: 'Pago de aranceles, envíos y giros postales', icon: <CreditCard className="w-6 h-6" />, color: 'bg-emerald-600' },
    { id: 'RECLAMOS', label: 'Atención al Cliente y Reclamos', desc: 'Seguimiento de cartas, reclamos y asesoramiento', icon: <Headphones className="w-6 h-6" />, color: 'bg-rose-600' },
  ];

  const handlePrintTicket = async (categoryId: string) => {
    setIsGenerating(true);

    try {
      const ticket = await api.createTicket(categoryId);
      setGeneratedTicket(ticket);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffcc00', '#0b2545', '#f59e0b', '#ffffff'],
      });
    } catch (error) {
      console.error('Error al emitir ticket:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    setGeneratedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cb-blue-deep/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-cb-yellow-main shadow-2xl overflow-hidden">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-cb-blue-navy text-white border-b-2 border-cb-yellow-main">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cb-yellow-main text-cb-blue-navy">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-cb-yellow-bright">
                {generatedTicket ? 'Ticket Emitido con Éxito' : 'Emisión de Turno'}
              </h2>
              <p className="text-xs font-semibold text-white/80">
                {generatedTicket ? 'Por favor retire su ticket de la impresora' : 'Seleccione el tipo de trámite que realizará'}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!generatedTicket ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  disabled={isGenerating}
                  onClick={() => handlePrintTicket(cat.id)}
                  className="flex items-start gap-4 p-4 text-left rounded-2xl border-2 border-slate-200 hover:border-cb-yellow-main hover:bg-cb-yellow-light/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <div className={`p-3 rounded-2xl text-white ${cat.color} group-hover:scale-110 transition-transform shadow-md`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-cb-blue-navy group-hover:text-cb-blue-royal uppercase">
                      {cat.label}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 animate-scaleIn">
              <div className="w-72 p-6 bg-amber-50/50 rounded-2xl border-2 border-dashed border-slate-400 shadow-xl text-center font-mono relative">
                <div className="text-[10px] font-bold text-slate-400 tracking-widest mb-2 border-b border-slate-300 pb-1">
                  CORREOS DE BOLIVIA - AGBC
                </div>

                <div className="text-xs font-extrabold text-cb-blue-navy uppercase mb-1">
                  {generatedTicket.category}
                </div>

                <div className="text-4xl font-black text-cb-blue-deep tracking-wider my-3 py-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                  {generatedTicket.ticketNumber}
                </div>

                <div className="text-[11px] font-bold text-slate-600 mb-3">
                  Espere su llamado en las pantallas de sala
                </div>

                <div className="flex items-center justify-center my-3 p-2 bg-white rounded-lg border border-slate-200">
                  <QrCode className="w-16 h-16 text-cb-blue-navy" />
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 border-t border-slate-300 pt-2">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(generatedTicket.createdAt).toLocaleTimeString('es-BO')} - Kiosco 01</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="mt-6 flex items-center gap-2 px-8 py-3 rounded-full bg-cb-blue-navy text-cb-yellow-bright font-black uppercase text-sm shadow-lg hover:bg-cb-blue-royal transition-transform hover:scale-105 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Finalizar y Volver al Menú</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

