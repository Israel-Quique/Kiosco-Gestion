import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Clock, Users, Sparkles, LogOut } from 'lucide-react';
import { Header } from '../components/common/Header.js';
import { api, socket } from '../services/api.js';
import { TicketItem, QueueData } from '../types/index.js';

import { useNavigate } from 'react-router-dom';

export const QueueDisplayView: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [lastCalled, setLastCalled] = useState<TicketItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const lastSpokenIdRef = useRef<string | null>(null);

  const announceTicket = useCallback((ticket: TicketItem) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    if (lastSpokenIdRef.current === ticket.id) return;

    lastSpokenIdRef.current = ticket.id;

    const text = `Turno ${ticket.ticketNumber.replace('-', ' ')}, pase a Ventanilla ${ticket.windowNumber || 1}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [soundEnabled]);

  const loadQueue = useCallback(async () => {
    try {
      const data = await api.getQueueStatus();
      setQueue(data);
      if (data.called.length > 0) {
        setLastCalled(data.called[0]);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }, []);

  useEffect(() => {
    loadQueue();

    socket.on('ticket:called', (ticket: TicketItem) => {
      setLastCalled(ticket);
      loadQueue();
      announceTicket(ticket);
    });

    socket.on('ticket:created', () => loadQueue());
    socket.on('ticket:completed', () => loadQueue());

    return () => {
      socket.off('ticket:called');
      socket.off('ticket:created');
      socket.off('ticket:completed');
    };
  }, [loadQueue, announceTicket]);

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-[#071930] via-[#0b2545] to-[#0e305d] text-white overflow-hidden select-none font-montserrat">
      
      <button
        onClick={() => navigate('/admin')}
        className="absolute top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-full border border-rose-500/30 transition-colors text-xs font-bold"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar TV Turnos</span>
      </button>

      <Header
        currentMode="queue"
        title="PANTALLA DE TURNOS Y ATENCIÓN EN SALA"
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1600px] mx-auto w-full overflow-hidden">
        <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-gradient-to-b from-[#0e2a4f] to-[#091b33] rounded-3xl border-4 border-cb-yellow-main shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cb-yellow-main/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cb-yellow-bright opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cb-yellow-main shadow-[0_0_12px_#ffcc00]"></span>
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-cb-yellow-bright">
                ÚLTIMO TURNO LLAMADO
              </span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/10 text-white/50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{soundEnabled ? 'Voz Activada' : 'Voz Silenciada'}</span>
            </button>
          </div>

          {lastCalled ? (
            <div className="flex flex-col items-center justify-center my-auto py-6 animate-scaleIn">
              <span className="text-2xl font-black tracking-widest text-white/80 uppercase">
                {lastCalled.category}
              </span>

              <div className="text-8xl md:text-9xl font-black text-cb-yellow-bright tracking-wider my-4 drop-shadow-[0_8px_30px_rgba(255,204,0,0.4)]">
                {lastCalled.ticketNumber}
              </div>

              <div className="flex items-center gap-4 px-10 py-4 bg-white rounded-3xl border-4 border-cb-yellow-main shadow-2xl text-cb-blue-navy">
                <span className="text-xl font-bold uppercase tracking-wider">Pase a</span>
                <span className="text-4xl md:text-5xl font-black tracking-tight">
                  VENTANILLA {lastCalled.windowNumber || 1}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto text-center py-12 text-white/40">
              <Clock className="w-16 h-16 mb-4 animate-pulse" />
              <p className="text-xl font-extrabold uppercase">Esperando próximo llamado...</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t-2 border-white/10 pt-4 text-xs font-semibold text-white/70">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cb-yellow-bright" />
              Correos de Bolivia - Sistema de Atención al Ciudadano
            </span>
            <span>Atención de Lunes a Viernes</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 p-6 bg-[#091b33] rounded-3xl border-2 border-white/10 shadow-xl flex flex-col overflow-hidden">
            <h3 className="text-sm font-black uppercase text-cb-yellow-bright mb-4 flex items-center justify-between">
              <span>Turnos Anteriores</span>
              <span className="text-xs font-bold text-white/50">Historial</span>
            </h3>

            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
              {queue?.called.slice(1, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl"
                >
                  <div>
                    <div className="text-2xl font-black text-white">{ticket.ticketNumber}</div>
                    <div className="text-xs text-white/60 font-semibold">{ticket.category}</div>
                  </div>
                  <div className="px-4 py-2 bg-cb-yellow-main text-cb-blue-navy rounded-xl text-sm font-black uppercase">
                    Ventanilla {ticket.windowNumber || 1}
                  </div>
                </div>
              ))}

              {(!queue || queue.called.length <= 1) && (
                <div className="text-center py-12 text-xs font-bold text-white/40">
                  No hay más turnos en cola reciente.
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-cb-yellow-main to-cb-yellow-gold rounded-3xl text-cb-blue-navy flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-cb-blue-deep/70">
                Personas en Espera
              </span>
              <div className="text-3xl font-black mt-0.5">
                {queue?.waitingCount || 0} ciudadanos
              </div>
            </div>
            <div className="p-3.5 bg-cb-blue-navy text-cb-yellow-bright rounded-2xl shadow-md">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
