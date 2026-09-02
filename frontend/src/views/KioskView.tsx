import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Check, MapPin, X } from 'lucide-react';
import { api } from '../services/api.js';
import { loadDesignConfig } from '../store/cardStore';
import { DEFAULT_BRANCHES, loadActiveBranchCode, loadBranches, saveActiveBranchCode } from '../store/branchStore';
import { clearDailySession } from '../store/authStore';

// ─── Tipo de tarjeta ───────────────────────────────────────────────────────────
interface ServiceCard {
  id: string;
  title: string;
  image: string;
  url: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// ─── Servicios por defecto ─────────────────────────────────────────────────────
const DEFAULT_CARDS: ServiceCard[] = [
  {
    id: 'rastreo',
    title: 'RASTREO DE CORRESPONDENCIA',
    image: '/RASTREO.png',
    url: 'https://trackingbo.correos.gob.bo:8100/',
    position: 'top-left',
  },
  {
    id: 'calculadora',
    title: 'CALCULADORA POSTAL',
    image: '/CALCULO.png',
    url: 'https://postar.correos.gob.bo:8104/',
    position: 'top-right',
  },
  {
    id: 'reclamos',
    title: 'SISTEMA DE RECLAMOS',
    image: '/RECLAMO2.png',
    url: 'https://sireco.correos.gob.bo:8102/',
    position: 'bottom-left',
  },
  {
    id: 'preenvio',
    title: 'GENERAR PREENVÍO',
    image: '/Preenvio.jpg',
    url: 'https://trackingbo.correos.gob.bo:8100/hacer-envio-desde-casa',
    position: 'bottom-center',
  },
  {
    id: 'aduana',
    title: 'KIOSCO ADUANA',
    image: '/DECLARACION2.png',
    url: 'https://ips.correos.gob.bo/CDS.Web/Operational/andeclaration.aspx',
    position: 'bottom-right',
  },
];

const POSITION_BY_CODE: Record<string, ServiceCard['position']> = {
  TRACKINGBO: 'top-left',
  POSTAR: 'top-right',
  SIRECO: 'bottom-left',
  PREENVIO: 'bottom-center',
  ADUANA: 'bottom-right',
};

const THREE_LAYOUT_CONFIG = {
  gridMaxWidth: 'min(900px, 100%)',
  columnGap: '10px',
  rowTemplate: '480px 480px',
  cardMaxWidth: '430px',
  ticketSize: '340px',
};

const FOUR_LAYOUT_CONFIG = {
  gridMaxWidth: 'min(1100px, 100%)',
  gap: '24px',
  rowTemplate: 'minmax(0, 1fr) minmax(0, 1fr)',
  cardMaxWidth: '520px',
  ticketSize: '280px',
};

const FIVE_LAYOUT_CONFIG = {
  gridMaxWidth: 'min(1220px, 100%)',
  gap: '24px',
  rowTemplate: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
  cardMaxWidth: '500px',
  ticketSize: '240px',
};

const TICKET_URL = 'http://172.65.10.55:8106/tickets';

// ─── Modal de servicio embebido ────────────────────────────────────────────────
interface ServiceModalProps {
  card: ServiceCard;
  onClose: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ card, onClose }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 animate-fadeIn">
      {/* Header del modal */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-[#071930] via-[#0b2545] to-[#0e305d] border-b-4 border-[#ffcc00] shadow-xl flex-shrink-0 min-h-[92px]">
        <div className="flex items-center gap-4 min-w-0">
          <img src="/correos2.png" alt="Correos de Bolivia" className="h-12 md:h-14 w-auto object-contain drop-shadow-md shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.28em] text-[#ffcc00] leading-none">
              Servicio embebido
            </span>
            <h2 className="text-base md:text-xl font-black text-white uppercase tracking-wide truncate">
              {card.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="group inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#ffcc00] text-[#071930] shadow-lg shadow-black/20 ring-2 ring-white/10 transition-all hover:scale-105 hover:brightness-105 active:scale-95"
            title="Volver al inicio"
            aria-label="Volver al inicio"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="group inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 text-white shadow-lg shadow-black/20 ring-2 ring-white/10 transition-all hover:scale-105 hover:bg-rose-600 active:scale-95"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <LoadingScreen message="Cargando servicio..." />
      )}

      {/* iFrame */}
      <iframe
        id="svc-iframe"
        src={card.url}
        title={card.title}
        className="flex-1 w-full border-none"
        onLoad={() => setLoading(false)}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

const LoadingAnimation: React.FC = () => (
  <div className="loading-scene" aria-hidden="true">
    <div className="loading-sun" />
    <div className="loading-cloud loading-cloud-one" />
    <div className="loading-cloud loading-cloud-two" />
    <div className="loading-road" />
    <div className="loading-tree loading-tree-one" />
    <div className="loading-tree loading-tree-two" />
    <div className="loading-truck">
      <div className="loading-truck-cab" />
      <div className="loading-truck-box" />
      <span className="loading-wheel loading-wheel-front" />
      <span className="loading-wheel loading-wheel-back" />
    </div>
  </div>
);

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="loading-screen absolute inset-0 top-[92px] md:top-[100px] z-10">
    <div className="loading-screen-copy">
      <div className="loading-spinner" />
      <h2>{message}</h2>
      <p>Estamos esperando respuesta. Si tarda demasiado, puede haber una caída temporal.<br />Si deseas salir, usa &quot;Volver&quot; o &quot;Inicio&quot;.</p>
    </div>
    <LoadingAnimation />
  </div>
);

const TicketServiceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 animate-fadeIn">
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-[#071930] via-[#0b2545] to-[#0e305d] border-b-4 border-[#ffcc00] shadow-xl flex-shrink-0 min-h-[92px]">
        <div className="flex items-center gap-4 min-w-0">
          <img src="/correos2.png" alt="Correos de Bolivia" className="h-12 md:h-14 w-auto object-contain drop-shadow-md shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.28em] text-[#ffcc00] leading-none">
              Servicio embebido
            </span>
            <h2 className="text-base md:text-xl font-black text-white uppercase tracking-wide truncate">
              Sistema de turnos
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#ffcc00] text-[#071930] shadow-lg ring-2 ring-white/10 transition-all hover:scale-105 active:scale-95" title="Volver al inicio" aria-label="Volver al inicio">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 text-white shadow-lg ring-2 ring-white/10 transition-all hover:scale-105 hover:bg-rose-600 active:scale-95" title="Volver" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <LoadingScreen message="Cargando sistema de turnos..." />
      )}

      <iframe
        src={TICKET_URL}
        title="Sistema de turnos"
        className="flex-1 w-full border-none bg-white"
        onLoad={() => setLoading(false)}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

const BranchSwitcherModal: React.FC<{
  branches: ReturnType<typeof loadBranches>;
  activeBranchCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}> = ({ branches, activeBranchCode, onSelect, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
    <div className="w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-[#ffcc00] bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#071930] to-[#0e305d] px-6 py-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ffcc00]">Configuración</p>
          <h2 className="mt-1 text-xl font-black uppercase text-white">Seleccione una sucursal</h2>
        </div>
        <button onClick={onClose} className="rounded-full bg-white/10 p-3 text-white transition hover:bg-rose-600" title="Cerrar" aria-label="Cerrar">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto bg-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => {
          const selected = branch.code === activeBranchCode;
          return (
            <button
              key={branch.code}
              onClick={() => onSelect(branch.code)}
              className={`relative min-h-[110px] rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${selected ? 'border-[#ffcc00] bg-amber-50' : 'border-slate-200 hover:border-cb-blue-navy'}`}
            >
              {selected && <Check className="absolute right-3 top-3 h-5 w-5 text-amber-500" />}
              <MapPin className={`h-5 w-5 ${selected ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="mt-2 block text-sm font-black text-cb-blue-navy">{branch.name}</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">{branch.location}</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── Pantalla de inactividad ───────────────────────────────────────────────────
const IdleScreen: React.FC<{ onWakeUp: () => void }> = ({ onWakeUp }) => (
  <div
    className="fixed inset-0 z-40 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-[#071930] via-[#0b2545] to-[#0e305d] animate-fadeIn"
    onClick={onWakeUp}
  >
    <div className="relative flex flex-col items-center">
      {/* Halo pulsante */}
      <div className="absolute w-80 h-80 rounded-full bg-[#ffcc00]/10 animate-ping" />
      <div className="absolute w-60 h-60 rounded-full bg-[#ffcc00]/15 animate-pulse" />

      <img src="/correos2.png" alt="Correos de Bolivia" className="h-28 mb-8 relative z-10 drop-shadow-2xl" />
      <span className="text-[#ffcc00] font-black text-xl uppercase tracking-widest relative z-10 mb-2">
        Correos de Bolivia
      </span>
      <span className="text-white font-black text-4xl uppercase tracking-tight relative z-10 mb-3">
        Toque para comenzar
      </span>
      <p className="text-white/60 text-sm font-semibold relative z-10">
        Use el botón central para obtener su turno rápidamente.
      </p>
    </div>
  </div>
);

// ─── Modal de ticket ───────────────────────────────────────────────────────────
const TicketModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selected, setSelected] = useState('');
  const [printed, setPrinted] = useState(false);
  const [ticketNumber] = useState(`G-${String(Math.floor(Math.random() * 900) + 100)}`);

  const categories = [
    { id: 'GENERAL', label: 'Atención General' },
    { id: 'ENCOMIENDAS', label: 'Encomiendas y Paquetes' },
    { id: 'CAJAS', label: 'Cajas y Pagos' },
    { id: 'RECLAMOS', label: 'Reclamos y Consultas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#ffcc00] w-full max-w-md overflow-hidden">
        <div className="flex flex-col items-center py-8 bg-gradient-to-b from-[#071930] to-[#0b2545] border-b-4 border-[#ffcc00]">
          <img src="/correos2.png" alt="Correos de Bolivia" className="h-12 mb-3" />
          <span className="text-[#ffcc00] font-black text-xs uppercase tracking-widest">Sistema de Turnos</span>
          <h2 className="text-white font-black text-xl uppercase mt-2">Seleccione su Categoría</h2>
        </div>

        {!printed ? (
          <div className="p-6 flex flex-col gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`w-full px-5 py-4 rounded-2xl text-left font-black text-sm transition-all border-2 ${
                  selected === cat.id
                    ? 'bg-[#071930] text-[#ffcc00] border-[#ffcc00] scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#ffcc00] hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                disabled={!selected}
                onClick={() => setPrinted(true)}
                className="flex-1 py-3 bg-[#071930] text-[#ffcc00] rounded-2xl text-sm font-black uppercase hover:bg-[#0e305d] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Imprimir Turno
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Su turno es</p>
            <span className="text-6xl font-black text-[#071930] tracking-wider">{ticketNumber}</span>
            <p className="text-sm font-bold text-slate-600 text-center">
              Categoría: <strong>{categories.find(c => c.id === selected)?.label}</strong><br />
              Por favor espere a ser llamado.
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-[#ffcc00] text-[#071930] rounded-2xl font-black text-base uppercase hover:bg-yellow-300 transition active:scale-95"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── VISTA PRINCIPAL DEL KIOSCO ────────────────────────────────────────────────
export const KioskView: React.FC = () => {
  const navigate = useNavigate();
  const queryBranchCode = new URLSearchParams(window.location.search).get('sucursal');
  const [branches] = useState(() => loadBranches());
  const [activeBranchCode, setActiveBranchCode] = useState(() => queryBranchCode || loadActiveBranchCode());
  const activeBranch = branches.find((branch) => branch.code === activeBranchCode) || DEFAULT_BRANCHES[0];
  const [activeModal, setActiveModal] = useState<ServiceCard | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [branchSwitcherOpen, setBranchSwitcherOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [cards, setCards] = useState<ServiceCard[]>(DEFAULT_CARDS);
  const [visibleCardsCount, setVisibleCardsCount] = useState<number>(() => loadDesignConfig(activeBranchCode).visibleCardsCount);
  const [idleScreenEnabled, setIdleScreenEnabled] = useState(() => loadDesignConfig(activeBranchCode).idleScreenEnabled);
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(() => loadDesignConfig(activeBranchCode).idleTimeoutSeconds);
  const idleRef = useRef<number | null>(null);

  const resetIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    setIsIdle(false);
    if (!idleScreenEnabled) return;
    idleRef.current = window.setTimeout(() => setIsIdle(true), idleTimeoutSeconds * 1000);
  }, [idleScreenEnabled, idleTimeoutSeconds]);

  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [resetIdle]);

  useEffect(() => {
    const handleBranchShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        resetIdle();
        setBranchSwitcherOpen(true);
      }
    };

    window.addEventListener('keydown', handleBranchShortcut);
    return () => window.removeEventListener('keydown', handleBranchShortcut);
  }, [resetIdle]);

  useEffect(() => {
    let isMounted = true;

    api.getActiveServices()
      .then((services) => {
        if (!isMounted || services.length === 0) {
          return;
        }

        const mappedCards = services.map((service) => ({
          id: service.id,
          title: service.title,
          image: service.imageUrl,
          url: service.url,
          position: POSITION_BY_CODE[service.code] || 'bottom-right',
        }));

        setCards(mappedCards);
      })
      .catch((error) => {
        console.warn('No se pudieron cargar los servicios desde la API, usando el fallback local.', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncDesignConfig = () => {
      const branchConfig = loadDesignConfig(activeBranchCode);
      setVisibleCardsCount(branchConfig.visibleCardsCount);
      setIdleScreenEnabled(branchConfig.idleScreenEnabled);
      setIdleTimeoutSeconds(branchConfig.idleTimeoutSeconds);
    };

    syncDesignConfig();
    window.addEventListener('storage', syncDesignConfig);

    api.getConfig()
      .then((config) => {
        setVisibleCardsCount(config.visibleCardsCount);
        setIdleScreenEnabled(config.idleScreenEnabled);
        setIdleTimeoutSeconds(config.idleTimeoutSeconds);
      })
      .catch(() => {
        // Usa la configuración local solo como respaldo si no responde el backend.
      });

    return () => {
      window.removeEventListener('storage', syncDesignConfig);
    };
  }, [activeBranchCode]);

  const openCard = (card: ServiceCard) => {
    resetIdle();
    setActiveModal(card);
  };

  const openTicket = () => {
    resetIdle();
    setTicketOpen(true);
  };

  const switchBranch = (code: string) => {
    saveActiveBranchCode(code);
    setActiveBranchCode(code);
    window.history.replaceState({}, '', `/kiosco?sucursal=${encodeURIComponent(code)}`);
    setBranchSwitcherOpen(false);
  };

  const visibleCardOrder: ServiceCard['position'][] = [
    'top-left',
    'top-right',
    'bottom-center',
    'bottom-left',
    'bottom-right',
  ];

  const visibleCards = visibleCardOrder
    .map((position) => cards.find((card) => card.position === position))
    .filter((card): card is ServiceCard => Boolean(card))
    .slice(0, visibleCardsCount);
  const isThreeLayout = visibleCardsCount === 3;
  const isFourLayout = visibleCardsCount === 4;
  const isFiveLayout = visibleCardsCount === 5;

  const findCard = (...terms: string[]) => (
    cards.find((card) => terms.some((term) =>
      card.id.toLowerCase() === term.toLowerCase() ||
      card.title.toLowerCase().includes(term.toLowerCase()) ||
      card.position.toLowerCase() === term.toLowerCase()
    )) || null
  );

  const threeLayoutCards = {
    left: findCard('rastreo', 'TRACKINGBO', 'top-left'),
    right: findCard('calculadora', 'POSTAR', 'top-right'),
    bottom: findCard('preenvio', 'PREENVIO', 'bottom-center'),
  };

  const fourLayoutCards = [
    cards.find((card) => card.position === 'top-left'),
    cards.find((card) => card.position === 'top-right'),
    cards.find((card) => card.position === 'bottom-left'),
    cards.find((card) => card.position === 'bottom-center'),
  ].filter((card): card is ServiceCard => Boolean(card));

  const renderCard = (card: ServiceCard, style?: React.CSSProperties, titleAtTop = false) => {
    const isTopCard = card.position.startsWith('top');
    return (
      <button
        key={card.id}
        onClick={() => openCard(card)}
        style={style}
        className={`
          group relative flex overflow-hidden rounded-[28px] border-[4px] border-[#8a97ad] bg-[#071930]
          shadow-[0_14px_28px_rgba(7,25,48,0.18)] transition-all duration-200
          hover:border-[#ffcc00] hover:shadow-[0_18px_36px_rgba(7,25,48,0.24)] hover:scale-[1.015]
          active:scale-[0.99]
          aspect-square min-h-0 min-w-0 ${isTopCard || titleAtTop ? 'flex-col' : 'flex-col-reverse'}
        `}
      >
        <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#071930] to-[#0b2545] border-b-2 border-[#ffcc00]/30 flex-shrink-0">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#ffcc00] text-center leading-tight">
            {card.title}
          </h3>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden bg-white p-2">
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 rounded-[28px] bg-[#ffcc00]/0 transition-colors duration-200 group-hover:bg-[#ffcc00]/5 pointer-events-none" />
      </button>
    );
  };

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden select-none bg-gradient-to-br from-[#fff08a] via-[#ffcc00] to-[#f59e0b]">
      
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#071930] via-[#0b2545] to-[#0e305d] border-b-4 border-[#ffcc00] flex-shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src="/correos2.png"
            alt="Correos de Bolivia"
            className="h-12 object-contain drop-shadow-md cursor-pointer hover:scale-105 transition-transform"
            onClick={() => { clearDailySession(); navigate('/login'); }}
          />
          <div className="flex flex-col border-l-2 border-[#ffcc00]/40 pl-3">
            <span className="text-sm font-black tracking-widest text-[#ffcc00]">Correos de Bolivia</span>
            <span className="text-xs font-semibold text-white/80">{activeBranch.name}</span>
          </div>
        </div>

        <h1 className="text-lg font-black uppercase tracking-wider text-[#ffcc00] text-center flex-1">
          KIOSCO DIGITAL DE AUTOSERVICIO
        </h1>

        {/* Reloj */}
        <Clock />
      </header>

      {/* Grid principal */}
      <main className="flex-1 overflow-hidden p-4 md:p-5">
        {isThreeLayout ? (
          <div className="relative mx-auto flex h-full w-full max-w-[1680px] items-center justify-center rounded-[30px] border border-[#f7e18a] bg-[#f7d23d]/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] px-6 py-5 md:px-7 md:py-6">
            <div
              className="grid w-full grid-cols-2 items-center justify-center justify-items-center"
              style={{
                maxWidth: THREE_LAYOUT_CONFIG.gridMaxWidth,
                columnGap: THREE_LAYOUT_CONFIG.columnGap,
                rowGap: '0px',
                gridTemplateRows: THREE_LAYOUT_CONFIG.rowTemplate,
              }}
            >
              {threeLayoutCards.left && renderCard(threeLayoutCards.left, {
                gridColumn: '1',
                gridRow: '1',
                width: '100%',
                height: '100%',
                maxWidth: THREE_LAYOUT_CONFIG.cardMaxWidth,
                justifySelf: 'center',
                alignSelf: 'center',
                zIndex: 10,
              })}
              {threeLayoutCards.right && renderCard(threeLayoutCards.right, {
                gridColumn: '2',
                gridRow: '1',
                width: '100%',
                height: '100%',
                maxWidth: THREE_LAYOUT_CONFIG.cardMaxWidth,
                justifySelf: 'center',
                alignSelf: 'center',
                zIndex: 10,
              })}

              {threeLayoutCards.bottom && renderCard(threeLayoutCards.bottom, {
                gridColumn: '1 / span 2',
                gridRow: '2',
                width: '100%',
                height: '100%',
                maxWidth: THREE_LAYOUT_CONFIG.cardMaxWidth,
                justifySelf: 'center',
                alignSelf: 'center',
                zIndex: 10,
              })}

              <button
                onClick={openTicket}
                className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-[#071930] to-[#0e305d] shadow-[0_0_0_10px_rgba(255,204,0,0.32),0_0_64px_rgba(255,204,0,0.34)] transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ width: THREE_LAYOUT_CONFIG.ticketSize, height: THREE_LAYOUT_CONFIG.ticketSize }}
              >
                <span className="absolute inset-0 rounded-full border-[10px] border-[#ffcc00]/35 animate-ping opacity-20 pointer-events-none" />
                <strong className="text-2xl md:text-3xl font-black text-[#ffcc00] uppercase tracking-widest drop-shadow-lg">
                  TIQUET
                </strong>
                <span className="mt-2 rounded-full bg-[#ffcc00] px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-[#071930] shadow-md">
                  Sacar turno
                </span>
              </button>
            </div>
          </div>
        ) : isFourLayout ? (
          <div className="relative mx-auto flex h-full w-full max-w-[1680px] items-center justify-center rounded-[30px] border border-[#f7e18a] bg-[#f7d23d]/75 px-6 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] md:px-7 md:py-6">
            <div
              className="relative grid h-full w-full grid-cols-2 items-center justify-items-center"
              style={{
                maxWidth: FOUR_LAYOUT_CONFIG.gridMaxWidth,
                gap: FOUR_LAYOUT_CONFIG.gap,
                gridTemplateRows: FOUR_LAYOUT_CONFIG.rowTemplate,
              }}
            >
              {fourLayoutCards.map((card, index) => renderCard(card, {
                gridColumn: index % 2 === 0 ? '1' : '2',
                gridRow: index < 2 ? '1' : '2',
                width: '100%',
                height: '100%',
                maxWidth: FOUR_LAYOUT_CONFIG.cardMaxWidth,
                justifySelf: 'center',
                alignSelf: 'center',
                zIndex: 10,
              }))}

              <button
                onClick={openTicket}
                className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-[#071930] to-[#0e305d] shadow-[0_0_0_10px_rgba(255,204,0,0.32),0_0_64px_rgba(255,204,0,0.34)] transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ width: FOUR_LAYOUT_CONFIG.ticketSize, height: FOUR_LAYOUT_CONFIG.ticketSize }}
              >
                <span className="absolute inset-0 rounded-full border-[10px] border-[#ffcc00]/35 animate-ping opacity-20 pointer-events-none" />
                <strong className="text-2xl md:text-3xl font-black text-[#ffcc00] uppercase tracking-widest drop-shadow-lg">
                  TIQUET
                </strong>
                <span className="mt-2 rounded-full bg-[#ffcc00] px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-[#071930] shadow-md">
                  Sacar turno
                </span>
              </button>
            </div>
          </div>
        ) : isFiveLayout ? (
          <div className="relative mx-auto flex h-full w-full max-w-[1680px] items-center justify-center rounded-[30px] border border-[#f7e18a] bg-[#f7d23d]/75 px-6 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] md:px-7 md:py-6">
            <div
              className="relative grid h-full w-full grid-cols-2 items-center justify-items-center"
              style={{
                maxWidth: FIVE_LAYOUT_CONFIG.gridMaxWidth,
                gap: FIVE_LAYOUT_CONFIG.gap,
                gridTemplateRows: FIVE_LAYOUT_CONFIG.rowTemplate,
              }}
            >
              {visibleCards.map((card, index) => renderCard(card, {
                gridColumn: index === 0 ? '1 / span 2' : index % 2 === 0 ? '2' : '1',
                gridRow: index === 0 ? '1' : index < 3 ? '2' : '3',
                width: '100%',
                height: '100%',
                maxWidth: FIVE_LAYOUT_CONFIG.cardMaxWidth,
                justifySelf: 'center',
                alignSelf: 'center',
                zIndex: 10,
              }, index === 2))}

              <button
                onClick={openTicket}
                className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-[#071930] to-[#0e305d] shadow-[0_0_0_10px_rgba(255,204,0,0.32),0_0_64px_rgba(255,204,0,0.34)] transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ width: FIVE_LAYOUT_CONFIG.ticketSize, height: FIVE_LAYOUT_CONFIG.ticketSize }}
              >
                <span className="absolute inset-0 rounded-full border-[10px] border-[#ffcc00]/35 animate-ping opacity-20 pointer-events-none" />
                <strong className="text-2xl md:text-3xl font-black text-[#ffcc00] uppercase tracking-widest drop-shadow-lg">
                  TIQUET
                </strong>
                <span className="mt-2 rounded-full bg-[#ffcc00] px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-[#071930] shadow-md">
                  Sacar turno
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-[14px]">
            {visibleCards.map(card => {
              const isTopCard = card.position.startsWith('top');
              return (
                <button
                  key={card.id}
                  onClick={() => openCard(card)}
                  className={`
                    group relative flex overflow-hidden rounded-3xl border-4 border-white/60 bg-[#071930] shadow-xl
                    hover:border-[#ffcc00] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200 ${isTopCard ? 'flex-col' : 'flex-col-reverse'}
                  `}
                >
                  <div className="flex items-center justify-center border-b-2 border-[#ffcc00]/30 bg-gradient-to-r from-[#071930] to-[#0b2545] px-4 py-3 flex-shrink-0">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#ffcc00] text-center leading-tight">
                      {card.title}
                    </h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-hidden bg-white p-2">
                    <img src={card.image} alt={card.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-[#ffcc00]/0 transition-colors duration-200 group-hover:bg-[#ffcc00]/5 pointer-events-none" />
                </button>
              );
            })}

            <div className="col-start-2 row-start-1 row-span-2 flex items-center justify-center z-20">
              <button
                onClick={openTicket}
                className="relative group flex h-full w-full max-w-[312px] max-h-[312px] flex-col items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-[#071930] to-[#0e305d] shadow-[0_0_0_10px_rgba(255,204,0,0.32),0_0_64px_rgba(255,204,0,0.34)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 rounded-full border-[10px] border-[#ffcc00]/35 animate-ping opacity-20 pointer-events-none" />
                <strong className="text-3xl md:text-4xl font-black text-[#ffcc00] uppercase tracking-widest drop-shadow-lg">
                  TIQUET
                </strong>
                <span className="mt-2.5 rounded-full bg-[#ffcc00] px-5 py-2 text-xs md:text-sm font-black uppercase tracking-wider text-[#071930] shadow-md">
                  Sacar turno
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modales */}
      {activeModal && (
        <ServiceModal card={activeModal} onClose={() => setActiveModal(null)} />
      )}
      {ticketOpen && (
        <TicketServiceModal onClose={() => setTicketOpen(false)} />
      )}
      {branchSwitcherOpen && (
        <BranchSwitcherModal
          branches={branches}
          activeBranchCode={activeBranchCode}
          onSelect={switchBranch}
          onClose={() => setBranchSwitcherOpen(false)}
        />
      )}
      {isIdle && (
        <IdleScreen onWakeUp={resetIdle} />
      )}
    </div>
  );
};

// ─── Reloj ────────────────────────────────────────────────────────────────────
const Clock: React.FC = () => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const online = (
    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[10px] font-extrabold tracking-wider text-emerald-300">ONLINE</span>
    </span>
  );

  return (
    <div className="flex items-center gap-3 px-3.5 py-1 bg-white/10 border border-[#ffcc00]/30 rounded-full flex-shrink-0">
      <div className="flex flex-col items-end">
        <span className="text-sm font-black tracking-wider text-[#ffcc00] tabular-nums">
          {time.toLocaleTimeString('es-BO', { hour12: false })}
        </span>
        <span className="text-[10px] font-semibold text-white/80 capitalize">
          {time.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </div>
      {online}
    </div>
  );
};

