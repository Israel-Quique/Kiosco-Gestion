import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  LayoutGrid,
  Monitor,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  Radio,
  Plus,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Image,
  Link2,
  Eye,
  Tag,
  Layers,
  SlidersHorizontal,
  MapPin,
  Check,
  Settings,
  Wifi,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { loadDesignConfig, saveDesignConfig } from '../store/cardStore';
import { api, type ConnectionCheck } from '../services/api.js';
import { DEFAULT_BRANCHES, loadActiveBranchCode, loadBranches, saveActiveBranchCode, saveBranches } from '../store/branchStore';
import type { KioskItem } from '../types/index.js';
import { clearDailySession } from '../store/authStore';

// ─── TIPOS LOCALES ───────────────────────────────────────────────────────────

type CardStatus = 'activo' | 'inactivo' | 'borrador';
type CardVista = 'kiosco' | 'admin' | 'ambos';

interface KioskCard {
  id: string;
  nombre: string;
  imagen: string;       // URL de la imagen
  url: string;          // URL de destino al hacer clic
  vista: CardVista;     // dónde aparecerá la tarjeta
  estado: CardStatus;
  creadoEn: string;
}

// ─── DATOS INICIALES DE EJEMPLO ───────────────────────────────────────────────

const initialCards: KioskCard[] = [
  {
    id: 'TRACKINGBO',
    nombre: 'Rastreo de Correspondencia',
    imagen: '/RASTREO.png',
    url: 'https://trackingbo.correos.gob.bo:8100/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-31',
  },
  {
    id: 'POSTAR',
    nombre: 'Calculadora Postal',
    imagen: '/CALCULO.png',
    url: 'https://postar.correos.gob.bo:8104/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-31',
  },
  {
    id: 'SIRECO',
    nombre: 'Sistema de Reclamos',
    imagen: '/RECLAMO2.png',
    url: 'https://sireco.correos.gob.bo:8102/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-31',
  },
  {
    id: 'PREENVIO',
    nombre: 'Generar Preenvio',
    imagen: '/Preenvio.jpg',
    url: 'https://trackingbo.correos.gob.bo:8100/hacer-envio-desde-casa',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-31',
  },
  {
    id: 'ADUANA',
    nombre: 'Kiosco Aduana',
    imagen: '/DECLARACION2.png',
    url: 'https://ips.correos.gob.bo/CDS.Web/Operational/andeclaration.aspx',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-31',
  },
];

// ─── BADGE DE ESTADO ─────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ estado: CardStatus }> = ({ estado }) => {
  const cfg = {
    activo:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Activo' },
    inactivo: { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'Inactivo' },
    borrador: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Borrador' },
  }[estado];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${estado === 'activo' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

// ─── BADGE DE VISTA ──────────────────────────────────────────────────────────

const VistaBadge: React.FC<{ vista: CardVista }> = ({ vista }) => {
  const cfg = {
    kiosco: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Kiosco' },
    admin:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
    ambos:  { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Ambos' },
  }[vista];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
      <Layers className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─── MODAL CREACIÓN / EDICIÓN ─────────────────────────────────────────────────

interface DesignStylesPanelProps {
  cards: KioskCard[];
  branches: KioskItem[];
  activeBranchCode: string;
  onChangeBranch: (code: string) => void;
  visibleCardsCount: number;
  onChangeVisibleCardsCount: (count: number) => void;
  onSaveDesign: () => void;
  isDesignSaved: boolean;
}

const DesignStylesPanel: React.FC<DesignStylesPanelProps> = ({
  cards,
  branches,
  activeBranchCode,
  onChangeBranch,
  visibleCardsCount,
  onChangeVisibleCardsCount,
  onSaveDesign,
  isDesignSaved,
}) => {
  const activeBranch = branches.find((branch) => branch.code === activeBranchCode) || branches[0];
  const designOptions = [
    { count: 3, title: '3 Tarjetas + Tiquet', hint: 'Diseño compacto con llamado central.' },
    { count: 4, title: '4 Tarjetas + Tiquet', hint: 'Equilibrio entre visual y atención.' },
    { count: 5, title: '5 Tarjetas (Sin Tiquet)', hint: 'Vista limpia para kiosco completo.' },
    { count: 6, title: '6 Tarjetas (Sin Tiquet)', hint: 'Máxima densidad sin ticket visible.' },
  ];

  const designHasTicket = visibleCardsCount <= 4;
  const designLabel = `${visibleCardsCount} tarjetas ${designHasTicket ? '+ tiquet' : '(sin tiquet)'}`;
  const previewCards = (() => {
    const activeCards = cards.filter((card) => card.estado === 'activo');
    if (visibleCardsCount === 3) {
      const preferredIds = ['TRACKINGBO', 'POSTAR', 'PREENVIO'];
      const selected = preferredIds
        .map((id) => activeCards.find((card) => card.id === id))
        .filter((card): card is KioskCard => Boolean(card));
      const remaining = activeCards.filter((card) => !selected.some((picked) => picked.id === card.id));
      return [...selected, ...remaining].slice(0, 3);
    }

    return activeCards.slice(0, Math.min(activeCards.length, visibleCardsCount));
  })();

  type PreviewTile =
    | { kind: 'card'; card: KioskCard }
    | { kind: 'ticket' }
    | { kind: 'placeholder' };

  const previewTiles = (() => {
    const slots: PreviewTile[] = [];
    const queue = [...previewCards];

    if (designHasTicket) {
      if (queue.length > 0) {
        slots.push({ kind: 'card', card: queue.shift()! });
      }
      slots.push({ kind: 'ticket' });
    }

    while (queue.length > 0 && slots.length < 6) {
      slots.push({ kind: 'card', card: queue.shift()! });
    }

    while (slots.length < 6) {
      slots.push({ kind: 'placeholder' });
    }

    return slots.slice(0, 6);
  })();

  return (
    <div className="w-full max-w-none animate-fadeIn">
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5 md:p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cb-blue-navy text-cb-yellow-bright text-[10px] font-black uppercase tracking-[0.25em] shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Estilos de kiosco
          </div>
          <h3 className="mt-4 text-2xl font-black text-cb-blue-navy uppercase leading-tight">
            Configura la plantilla
          </h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Selecciona la configuración de estilo o módulos requerida para actualizar la vista previa en pantalla.
          </p>
          <div className="mt-5 rounded-2xl border border-cb-yellow-main/50 bg-amber-50 p-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-cb-blue-navy">
              <MapPin className="h-4 w-4 text-amber-500" />
              Diseño de la sucursal
            </label>
            <select
              value={activeBranchCode}
              onChange={(event) => onChangeBranch(event.target.value)}
              className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-cb-blue-navy outline-none focus:border-cb-yellow-main"
            >
              {branches.map((branch) => (
                <option key={branch.code} value={branch.code}>{branch.name} - {branch.location}</option>
              ))}
            </select>
            {activeBranch && <p className="mt-2 text-[10px] font-semibold text-slate-500">Código del equipo: {activeBranch.code}</p>}
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
              <span className="text-[#ffb800]">◉</span>
              Estilos disponibles
            </div>
            <div className="space-y-2.5">
              {designOptions.map((option) => {
                const isSelected = visibleCardsCount === option.count;
                return (
                  <button
                    key={option.count}
                    onClick={() => onChangeVisibleCardsCount(option.count)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#ffb800] bg-amber-50 shadow-[0_10px_24px_rgba(255,184,0,0.14)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`text-sm font-black ${isSelected ? 'text-cb-blue-navy' : 'text-slate-700'}`}>
                        {option.title}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 leading-tight">
                        {option.hint}
                      </div>
                    </div>
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${isSelected ? 'border-[#ffb800]' : 'border-slate-300'}`}>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-[#ffb800]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modulo</p>
              <p className="text-sm font-black text-cb-blue-navy mt-1">{designHasTicket ? 'Tiquet On' : 'Tiquet Off'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Espacios</p>
              <p className="text-sm font-black text-cb-blue-navy mt-1">6 slots</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estilo</p>
              <p className="text-sm font-black text-cb-blue-navy mt-1">Grid 6</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSaveDesign}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cb-blue-navy px-4 py-3 text-xs font-black uppercase text-cb-yellow-bright shadow-md transition hover:bg-cb-blue-royal active:scale-[0.99]"
          >
            <Check className="h-4 w-4" />
            {isDesignSaved ? 'Configuración guardada' : 'Guardar configuración'}
          </button>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-[#071930] to-[#0b2545]">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffb800]">
                Previsualizacion de estilo
              </p>
              <h3 className="text-lg md:text-xl font-black text-white uppercase truncate">
                Plantilla interactiva kiosco de atencion
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                Sucursal: {activeBranch?.name || 'Sin sucursal'}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#ffcc00] border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">
              {designLabel}
            </span>
          </div>
          <div className="bg-[#f0be4a] p-5 md:p-6 min-h-[720px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {previewTiles.map((tile, index) => {
                if (tile.kind === 'ticket') {
                  return (
                    <div
                      key={`ticket-${index}`}
                      className="group relative flex min-h-[210px] flex-col items-center justify-center rounded-[18px] border-2 border-cb-blue-navy bg-cb-blue-navy shadow-[0_10px_24px_rgba(7,25,48,0.18)]"
                    >
                      <span className="text-3xl font-black text-[#ffcc00] uppercase tracking-widest drop-shadow-sm">
                        TIQUET
                      </span>
                      <span className="mt-3 px-4 py-1.5 rounded-full bg-[#ffcc00] text-cb-blue-navy text-[11px] font-black uppercase tracking-widest">
                        Sacar turno
                      </span>
                    </div>
                  );
                }

                if (tile.kind === 'placeholder') {
                  return (
                    <div
                      key={`placeholder-${index}`}
                      className="group relative flex min-h-[210px] flex-col items-center justify-center rounded-[18px] border-2 border-cb-blue-navy bg-white shadow-[0_8px_18px_rgba(7,25,48,0.14)] overflow-hidden"
                    >
                      <div className="flex h-full w-full items-center justify-center bg-[#f5f7fb]">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 bg-white text-cb-blue-navy text-3xl font-black shadow-sm">
                          +
                        </div>
                      </div>
                      <div className="w-full border-t-2 border-cb-blue-navy bg-[#f7f2e0] px-3 py-2 text-center">
                        <h4 className="text-sm font-black uppercase tracking-[0.08em] text-cb-blue-navy">
                          Nuevo servicio
                        </h4>
                      </div>
                    </div>
                  );
                }

                return (
                  <article
                    key={tile.card.id}
                    className="group relative flex min-h-[210px] flex-col overflow-hidden rounded-[18px] border-2 border-cb-blue-navy bg-white shadow-[0_8px_18px_rgba(7,25,48,0.14)]"
                  >
                    <div className="flex items-center justify-center px-3 py-2.5 bg-[#f7f2e0] border-b-2 border-cb-blue-navy">
                      <h4 className="text-[12px] md:text-sm font-black uppercase tracking-[0.08em] text-cb-blue-navy text-center leading-tight">
                        {tile.card.nombre}
                      </h4>
                    </div>
                    <div className="flex flex-1 items-center justify-center p-4 bg-white">
                      <img
                        src={tile.card.imagen}
                        alt={tile.card.nombre}
                        className="max-h-[120px] w-auto object-contain drop-shadow-md transition-transform group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex items-center justify-center border-t-2 border-cb-blue-navy bg-white px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full bg-cb-blue-navy px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-sm"
                      >
                        Seleccionar tarjeta
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface CardModalProps {
  card: Partial<KioskCard> | null;
  onClose: () => void;
  onSave: (card: KioskCard) => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<KioskCard>>({
    nombre: '',
    imagen: '',
    url: '',
    vista: 'kiosco',
    estado: 'borrador',
    ...card,
  });

  const isEdit = !!card?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.url) return;

    onSave({
      id: form.id || String(Date.now()),
      nombre: form.nombre!,
      imagen: form.imagen || '',
      url: form.url!,
      vista: form.vista as CardVista,
      estado: form.estado as CardStatus,
      creadoEn: form.creadoEn || new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-cb-yellow-main w-full max-w-lg overflow-hidden animate-fadeIn">
        
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#071930] to-[#0b2545] border-b-4 border-cb-yellow-main">
          <div>
            <h3 className="text-base font-black text-cb-yellow-bright uppercase tracking-wide">
              {isEdit ? '✏️ Editar Tarjeta' : '✨ Nueva Tarjeta'}
            </h3>
            <p className="text-xs text-white/60 font-semibold mt-0.5">
              {isEdit ? 'Modifica los campos y guarda los cambios.' : 'Completa los campos para crear una nueva tarjeta en el kiosco.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-rose-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-1.5">
              <Tag className="w-3.5 h-3.5 text-cb-blue-navy" />
              Nombre de la Tarjeta *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Rastreo de Paquetes"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-cb-yellow-main focus:border-cb-yellow-main outline-none transition-all"
            />
          </div>

          {/* Imagen URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-1.5">
              <Image className="w-3.5 h-3.5 text-cb-blue-navy" />
              URL de la Imagen
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={form.imagen}
                onChange={e => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.png"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 focus:ring-2 focus:ring-cb-yellow-main focus:border-cb-yellow-main outline-none transition-all"
              />
              {form.imagen && (
                <img
                  src={form.imagen}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-contain bg-slate-100 border border-slate-200 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = ''; }}
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">Pega la URL pública de la imagen. Se mostrará en la tarjeta del kiosco.</p>
          </div>

          {/* URL de destino */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-1.5">
              <Link2 className="w-3.5 h-3.5 text-cb-blue-navy" />
              URL de Destino *
            </label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://correos.com.bo/servicio"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 focus:ring-2 focus:ring-cb-yellow-main focus:border-cb-yellow-main outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1 ml-1">Esta es la URL a la que se redirigirá el ciudadano al tocar la tarjeta.</p>
          </div>

          {/* Vista y Estado en fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vista */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-1.5">
                <Eye className="w-3.5 h-3.5 text-cb-blue-navy" />
                Vista
              </label>
              <select
                value={form.vista}
                onChange={e => setForm({ ...form, vista: e.target.value as CardVista })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-cb-yellow-main outline-none"
              >
                <option value="kiosco">🖥️ Solo Kiosco Público</option>
                <option value="admin">⚙️ Solo Panel Admin</option>
                <option value="ambos">🔀 Ambas Vistas</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-1.5">
                <ToggleRight className="w-3.5 h-3.5 text-cb-blue-navy" />
                Estado
              </label>
              <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as CardStatus })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-cb-yellow-main outline-none"
              >
                <option value="activo">✅ Activo</option>
                <option value="inactivo">🚫 Inactivo</option>
                <option value="borrador">📝 Borrador</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cb-blue-navy hover:bg-cb-blue-royal text-cb-yellow-bright rounded-xl text-xs font-black uppercase shadow-md transition-colors active:scale-95"
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── PANEL PRINCIPAL ──────────────────────────────────────────────────────────

export const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tarjetas' | 'diseno' | 'kiosks' | 'configuracion'>('tarjetas');

  // Estado de tarjetas (en un sistema real, vendría del backend)
  const [cards, setCards] = useState<KioskCard[]>(initialCards);
  const [filterEstado, setFilterEstado] = useState<CardStatus | 'todos'>('todos');
  const [filterVista, setFilterVista] = useState<CardVista | 'todos'>('todos');
  const [modalCard, setModalCard] = useState<Partial<KioskCard> | null | false>(false);
  const [branches, setBranches] = useState<KioskItem[]>(() => loadBranches());
  const [activeBranchCode, setActiveBranchCode] = useState(() => loadActiveBranchCode());
  const [visibleCardsCount, setVisibleCardsCount] = useState<number>(() => loadDesignConfig(activeBranchCode).visibleCardsCount);
  const [idleScreenEnabled, setIdleScreenEnabled] = useState(() => loadDesignConfig(activeBranchCode).idleScreenEnabled);
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(() => loadDesignConfig(activeBranchCode).idleTimeoutSeconds);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });
  const [isDesignSaved, setIsDesignSaved] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [connectionChecks, setConnectionChecks] = useState<Record<string, ConnectionCheck>>({});
  const [checkingConnections, setCheckingConnections] = useState(false);

  useEffect(() => {
    api.getAllServices()
      .then((services) => {
        if (services.length > 0) {
          setCards(services.map((service) => ({
            id: service.id,
            nombre: service.title,
            imagen: service.imageUrl,
            url: service.url,
            vista: 'kiosco',
            estado: service.isActive ? 'activo' : 'inactivo',
            creadoEn: new Date().toISOString().slice(0, 10),
          })));
        }
      })
      .catch(() => {
        // Mantiene las tarjetas locales como respaldo si el backend no responde.
      });

    api.getConfig()
      .then((config) => {
        setVisibleCardsCount(config.visibleCardsCount);
        setIdleScreenEnabled(config.idleScreenEnabled);
        setIdleTimeoutSeconds(config.idleTimeoutSeconds);
      })
      .catch(() => {
        // El fallback local permite abrir el panel si el backend está apagado.
      });

    api.getKiosks()
      .then((remoteBranches) => {
        const storedBranches = loadBranches();
        const catalog = storedBranches.length > 0 ? storedBranches : DEFAULT_BRANCHES;
        const mergedBranches = catalog.map((branch) => {
          const remoteBranch = remoteBranches.find((item) => item.code === branch.code);
          return remoteBranch ? { ...branch, ...remoteBranch } : branch;
        });
        setBranches(mergedBranches);
        saveBranches(mergedBranches);
      })
      .catch(() => {
        setBranches(DEFAULT_BRANCHES);
      });
  }, []);

  useEffect(() => {
    saveActiveBranchCode(activeBranchCode);
    setIsDesignSaved(false);
    setIsSettingsSaved(false);
  }, [activeBranchCode]);

  const handleSaveDesign = async () => {
    try {
      const config = await api.saveConfig({ visibleCardsCount, idleScreenEnabled, idleTimeoutSeconds });
      setVisibleCardsCount(config.visibleCardsCount);
      setIdleScreenEnabled(config.idleScreenEnabled);
      setIdleTimeoutSeconds(config.idleTimeoutSeconds);
      saveDesignConfig(config, activeBranchCode);
      setIsDesignSaved(true);
    } catch {
      setIsDesignSaved(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const config = await api.saveConfig({ visibleCardsCount, idleScreenEnabled, idleTimeoutSeconds });
      setVisibleCardsCount(config.visibleCardsCount);
      setIdleScreenEnabled(config.idleScreenEnabled);
      setIdleTimeoutSeconds(config.idleTimeoutSeconds);
      saveDesignConfig(config, activeBranchCode);
      setIsSettingsSaved(true);
    } catch {
      setIsSettingsSaved(false);
    }
  };

  const handleChangeVisibleCardsCount = (count: number) => {
    setVisibleCardsCount(count);
    setIsDesignSaved(false);
  };

  const handleCreateBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newBranch.name.trim();
    const location = newBranch.location.trim();
    if (!name || !location) return;

    const slug = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 8) || 'NUEVA';
    let code = `KIOSK-${slug}-01`;
    let suffix = 1;
    while (branches.some((branch) => branch.code === code)) {
      suffix += 1;
      code = `KIOSK-${slug}-${String(suffix).padStart(2, '0')}`;
    }

    let created: KioskItem;
    try {
      created = await api.createKiosk({ code, name, location });
    } catch {
      created = {
        id: `branch-${Date.now()}`,
        code,
        name,
        location,
        isOnline: true,
        lastHeartbeat: new Date().toISOString(),
      };
    }
    const nextBranches = [...branches, created];
    setBranches(nextBranches);
    saveBranches(nextBranches);
    setActiveBranchCode(code);
    setNewBranch({ name: '', location: '' });
  };

  const designHasTicket = visibleCardsCount <= 4;
  const designLabel = `${visibleCardsCount} tarjetas ${designHasTicket ? '+ tiquet' : '(sin tiquet)'}`;
  const previewCards = (() => {
    if (visibleCardsCount === 3) {
      const preferredIds = ['TRACKINGBO', 'POSTAR', 'PREENVIO'];
      const selected = preferredIds
        .map((id) => cards.find((card) => card.id === id))
        .filter((card): card is KioskCard => Boolean(card));
      const remaining = cards.filter((card) => !selected.some((picked) => picked.id === card.id));
      return [...selected, ...remaining].slice(0, 3);
    }

    return cards.slice(0, Math.min(cards.length, visibleCardsCount));
  })();
  const designOptions = [
    { count: 3, title: '3 Tarjetas + Tiquet', hint: 'Diseño compacto con llamado central.' },
    { count: 4, title: '4 Tarjetas + Tiquet', hint: 'Equilibrio entre visual y atención.' },
    { count: 5, title: '5 Tarjetas (Sin Tiquet)', hint: 'Vista limpia para kiosco completo.' },
    { count: 6, title: '6 Tarjetas (Sin Tiquet)', hint: 'Máxima densidad sin ticket visible.' },
  ];
  const previewTiles = (() => {
    type PreviewTile =
      | { kind: 'card'; card: KioskCard }
      | { kind: 'ticket' }
      | { kind: 'placeholder' };

    const slots: PreviewTile[] = Array.from({ length: 6 }, () => ({ kind: 'placeholder' } as PreviewTile));

    if (designHasTicket && visibleCardsCount === 3) {
      if (previewCards[0]) {
        slots[0] = { kind: 'card', card: previewCards[0] };
      }

      slots[1] = { kind: 'ticket' };

      if (previewCards[1]) {
        slots[2] = { kind: 'card', card: previewCards[1] };
      }

      if (previewCards[2]) {
        slots[4] = { kind: 'card', card: previewCards[2] };
      }

      return slots;
    }

    const queue = [...previewCards];

    if (designHasTicket) {
      if (queue.length > 0) {
        slots.push({ kind: 'card', card: queue.shift()! });
      }

      slots.push({ kind: 'ticket' });
    }

    while (queue.length > 0 && slots.length < 6) {
      slots.push({ kind: 'card', card: queue.shift()! });
    }

    while (slots.length < 6) {
      slots.push({ kind: 'placeholder' });
    }

    return slots.slice(0, 6);
  })();

  // ── Acciones de tarjetas ──
  const handleOpenCreate = () => setModalCard({});
  const handleOpenEdit = (card: KioskCard) => setModalCard(card);
  const handleCloseModal = () => setModalCard(false);

  const handleSaveCard = async (saved: KioskCard) => {
    const serviceInput = {
      code: saved.id,
      name: saved.nombre,
      title: saved.nombre,
      description: '',
      url: saved.url,
      icon: 'link',
      colorTheme: 'blue',
      imageUrl: saved.imagen,
      orderIndex: cards.length + 1,
      isActive: saved.estado === 'activo',
    };
    try {
      const persisted = saved.id && cards.some((card) => card.id === saved.id)
        ? await api.updateService(saved.id, serviceInput)
        : await api.createService(serviceInput);
      saved = { ...saved, id: persisted.id };
    } catch {
      // El estado local permite continuar trabajando durante una caída del backend.
    }
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setModalCard(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleEstado = async (id: string) => {
    try {
      const persisted = await api.toggleService(id);
      setCards(prev => prev.map((card) => card.id === id ? { ...card, estado: persisted.isActive ? 'activo' : 'inactivo' } : card));
    } catch {
      setCards(prev => prev.map(c => {
        if (c.id !== id) return c;
        const next: CardStatus = c.estado === 'activo' ? 'inactivo' : 'activo';
        return { ...c, estado: next };
      }));
    }
  };

  const handleCheckConnections = async () => {
    setCheckingConnections(true);
    const results = await Promise.all(cards.map(async (card) => {
      try {
        return [card.id, await api.checkServiceConnection(card.url)] as const;
      } catch {
        return [card.id, {
          ok: false,
          status: null,
          responseTimeMs: 0,
          checkedAt: new Date().toISOString(),
          message: 'No se pudo consultar el servidor',
        }] as const;
      }
    }));
    setConnectionChecks(Object.fromEntries(results));
    setCheckingConnections(false);
  };

  // Tarjetas filtradas
  const filteredCards = cards.filter(c => {
    const okEstado = filterEstado === 'todos' || c.estado === filterEstado;
    const okVista  = filterVista  === 'todos' || c.vista  === filterVista;
    return okEstado && okVista;
  });

  const countByEstado = (e: CardStatus) => cards.filter(c => c.estado === e).length;
  const checkedCount = Object.values(connectionChecks).filter((check) => check.ok).length;
  const cardGroups = [
    { estado: 'activo' as const, title: 'Tarjetas visibles', cards: filteredCards.filter((card) => card.estado === 'activo') },
    { estado: 'inactivo' as const, title: 'Tarjetas apagadas', cards: filteredCards.filter((card) => card.estado === 'inactivo') },
    { estado: 'borrador' as const, title: 'Borradores', cards: filteredCards.filter((card) => card.estado === 'borrador') },
  ].filter((group) => group.cards.length > 0);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 overflow-hidden font-montserrat select-none">
      <Header
        currentMode="admin"
        onLogout={() => { clearDailySession(); navigate('/login'); }}
        title="PANEL DE GESTIÓN AGBC"
      />

      {/* Nav de pestañas */}
      <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tarjetas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'tarjetas'
                ? 'bg-cb-blue-navy text-cb-yellow-bright shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tarjetas</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'kiosks'
                ? 'bg-cb-blue-navy text-cb-yellow-bright shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Kioscos</span>
          </button>

          <button
            onClick={() => setActiveTab('diseno')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'diseno'
                ? 'bg-cb-blue-navy text-cb-yellow-bright shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Diseño y Estilos</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'configuracion'
                ? 'bg-cb-blue-navy text-cb-yellow-bright shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ══════════════ TAB: TARJETAS ══════════════ */}
        {activeTab === 'tarjetas' && (
          <div className="flex flex-col gap-5 animate-fadeIn w-full max-w-none">

            {/* KPIs rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Tarjetas', value: cards.length, icon: <LayoutGrid className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
                { label: 'Activas', value: countByEstado('activo'), icon: <CheckCircle className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Inactivas', value: countByEstado('inactivo'), icon: <ToggleLeft className="w-5 h-5" />, color: 'bg-rose-100 text-rose-700' },
                { label: 'Borradores', value: countByEstado('borrador'), icon: <Pencil className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700' },
              ].map((kpi, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                    <span className="text-3xl font-black text-cb-blue-navy">{kpi.value}</span>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.color}`}>{kpi.icon}</div>
                </div>
              ))}
            </div>

            {/* Barra de filtros y botón crear */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-black text-slate-500 uppercase mr-1">Filtrar:</span>

                {/* Filtro estado */}
                {(['todos', 'activo', 'inactivo', 'borrador'] as const).map(e => (
                  <button
                    key={e}
                    onClick={() => setFilterEstado(e)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      filterEstado === e
                        ? 'bg-cb-blue-navy text-cb-yellow-bright'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {e === 'todos' ? 'Todos los estados' : e}
                  </button>
                ))}

                <span className="mx-2 text-slate-300">|</span>

                {/* Filtro vista */}
                {(['todos', 'kiosco', 'admin', 'ambos'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setFilterVista(v)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      filterVista === v
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {v === 'todos' ? 'Todas las vistas' : v}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCheckConnections}
                  disabled={checkingConnections || cards.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cb-blue-navy text-cb-yellow-bright font-black text-xs uppercase shadow-md hover:bg-cb-blue-royal disabled:opacity-60 transition-all"
                >
                  <Wifi className={`w-4 h-4 ${checkingConnections ? 'animate-pulse' : ''}`} />
                  <span>{checkingConnections ? 'Verificando...' : 'Verificar conexión'}</span>
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cb-yellow-bright to-cb-yellow-main text-cb-blue-navy font-black text-xs uppercase shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Tarjeta</span>
                </button>
              </div>
            </div>

            {Object.keys(connectionChecks).length > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm text-xs font-bold text-slate-600">
                <Wifi className="h-4 w-4 text-cb-blue-navy" />
                <span>Conexión verificada: {checkedCount} de {cards.length} páginas responden</span>
                <span className="ml-auto text-[10px] uppercase text-slate-400">Última revisión: {new Date(Math.max(...Object.values(connectionChecks).map((check) => new Date(check.checkedAt).getTime()))).toLocaleTimeString()}</span>
              </div>
            )}

            {/* Grid de tarjetas */}
            {filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <LayoutGrid className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm font-bold">No hay tarjetas con los filtros seleccionados.</p>
                <button onClick={handleOpenCreate} className="mt-4 text-xs text-cb-blue-navy font-black underline underline-offset-2">
                  Crear la primera tarjeta
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {cardGroups.map((group) => (
                  <section key={group.estado}>
                    <div className="mb-3 flex items-center gap-2">
                      {group.estado === 'activo' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">{group.title}</h3>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-500">{group.cards.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
                {group.cards.map(card => (
                  <div
                    key={card.id}
                    className={`relative group flex flex-col bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      card.estado === 'activo'   ? 'border-emerald-200' :
                      card.estado === 'inactivo' ? 'border-rose-200 opacity-75' :
                                                   'border-dashed border-amber-300'
                    }`}
                  >
                    {/* Imagen */}
                    <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                      {card.imagen ? (
                        <img
                          src={card.imagen}
                          alt={card.nombre}
                          className="h-20 w-auto object-contain drop-shadow-md"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Image className="w-12 h-12 text-slate-300" />
                      )}

                      {/* Badge estado en esquina */}
                      <div className="absolute top-2 right-2">
                        <StatusBadge estado={card.estado} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h4 className="text-sm font-black text-cb-blue-navy leading-tight">{card.nombre}</h4>
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-blue-500 hover:underline truncate"
                      >
                        {card.url}
                      </a>

                      <div className="flex items-center gap-2 mt-1">
                        <VistaBadge vista={card.vista} />
                        <span className="text-[9px] text-slate-400 font-semibold ml-auto">{card.creadoEn}</span>
                      </div>
                      {connectionChecks[card.id] && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-black ${connectionChecks[card.id].ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <span className={`h-2 w-2 rounded-full ${connectionChecks[card.id].ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {connectionChecks[card.id].ok ? `Conectado (${connectionChecks[card.id].status})` : (connectionChecks[card.id].message || 'Sin respuesta')}
                          <span className="ml-auto font-semibold text-slate-400">{connectionChecks[card.id].responseTimeMs} ms</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 gap-2">
                      {/* Toggle activo/inactivo */}
                      <button
                        onClick={() => handleToggleEstado(card.id)}
                        title={card.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        className={`flex items-center gap-1 text-[10px] font-black rounded-lg px-2.5 py-1.5 transition-all ${
                          card.estado === 'activo'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {card.estado === 'activo'
                          ? <><ToggleRight className="w-3.5 h-3.5" /> On</>
                          : <><ToggleLeft className="w-3.5 h-3.5" /> Off</>
                        }
                      </button>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => handleOpenEdit(card)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )} 

        {/* ══════════════ TAB: DISEÑO ══════════════ */}
        {activeTab === 'diseno' && (
          <DesignStylesPanel
            cards={cards}
            branches={branches}
            activeBranchCode={activeBranchCode}
            onChangeBranch={setActiveBranchCode}
            visibleCardsCount={visibleCardsCount}
            onChangeVisibleCardsCount={handleChangeVisibleCardsCount}
            onSaveDesign={handleSaveDesign}
            isDesignSaved={isDesignSaved}
          />
        )}

        {activeTab === 'configuracion' && (
          <div className="mx-auto w-full max-w-3xl animate-fadeIn">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-cb-blue-navy px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-cb-yellow-bright">
                <Settings className="h-4 w-4" />
                Configuración del kiosco
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase text-cb-blue-navy">Pantalla de espera</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Controla si esta sucursal muestra la pantalla de espera después del tiempo de inactividad.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-black uppercase text-cb-blue-navy">Activar pantalla de espera</span>
                    <span className="mt-1 block text-xs text-slate-500">Sucursal: {branches.find((branch) => branch.code === activeBranchCode)?.name || activeBranchCode}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={idleScreenEnabled}
                    onChange={(event) => { setIdleScreenEnabled(event.target.checked); setIsSettingsSaved(false); }}
                    className="h-5 w-5 accent-cb-blue-navy"
                  />
                </label>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label htmlFor="idle-timeout" className="block text-sm font-black uppercase text-cb-blue-navy">Mostrar animación después de</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id="idle-timeout"
                    type="number"
                    min="5"
                    max="3600"
                    step="1"
                    value={idleTimeoutSeconds}
                    onChange={(event) => { setIdleTimeoutSeconds(Math.min(Math.max(Number(event.target.value) || 5, 5), 3600)); setIsSettingsSaved(false); }}
                    className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-cb-blue-navy outline-none focus:border-cb-yellow-main"
                  />
                  <span className="text-sm font-semibold text-slate-500">segundos sin actividad</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cb-blue-navy px-4 py-3 text-xs font-black uppercase text-cb-yellow-bright shadow-md transition hover:bg-cb-blue-royal"
              >
                <Check className="h-4 w-4" />
                {isSettingsSaved ? 'Configuración guardada' : 'Guardar configuración'}
              </button>
            </section>
          </div>
        )}

        {activeTab === 'kiosks' && (
          <div className="w-full animate-fadeIn">
            <div className="w-full">
              <section className="mb-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-cb-blue-navy px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-cb-yellow-bright">
                      <MapPin className="h-4 w-4" />
                      Sucursales
                    </div>
                    <h3 className="mt-3 text-xl font-black uppercase text-cb-blue-navy">Selecciona la sucursal</h3>
                    <p className="mt-1 text-sm text-slate-500">La sede seleccionada se utiliza en la vista previa del kiosco.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase text-emerald-700">
                    {branches.length} sucursales configuradas
                  </span>
                </div>
                <form onSubmit={handleCreateBranch} className="mt-5 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={newBranch.name}
                    onChange={(event) => setNewBranch({ ...newBranch, name: event.target.value })}
                    placeholder="Nombre de la sucursal"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-cb-yellow-main"
                  />
                  <input
                    value={newBranch.location}
                    onChange={(event) => setNewBranch({ ...newBranch, location: event.target.value })}
                    placeholder="Departamento o ciudad"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-cb-yellow-main"
                  />
                  <button type="submit" className="rounded-xl bg-cb-blue-navy px-4 py-2 text-xs font-black uppercase text-cb-yellow-bright transition-colors hover:bg-cb-blue-royal">
                    Crear sucursal
                  </button>
                </form>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                  {branches.map((branch) => {
                    const isSelected = branch.code === activeBranchCode;
                    return (
                      <button
                        key={branch.code}
                        type="button"
                        onClick={() => setActiveBranchCode(branch.code)}
                        className={`relative min-h-[92px] rounded-2xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-cb-yellow-main bg-amber-50 shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:border-cb-blue-navy'
                        }`}
                      >
                        {isSelected && <Check className="absolute right-2 top-2 h-4 w-4 text-amber-500" />}
                        <MapPin className={`h-5 w-5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="mt-2 block text-xs font-black leading-tight text-cb-blue-navy">{branch.name}</span>
                        <span className="mt-1 block text-[10px] font-semibold text-slate-500">{branch.location}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
              <section className="w-full rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-[#071930] to-[#0b2545]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ffcc00]">Vista previa</p>
                    <h3 className="text-lg font-black text-white uppercase">Kiosco digital de autoservicio</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="bg-slate-100 p-3">
                  <div className="relative h-[calc(100vh-190px)] min-h-[520px] rounded-[24px] overflow-hidden border-2 border-slate-200 bg-white shadow-inner">
                    <iframe
                      src={`/kiosco?sucursal=${encodeURIComponent(activeBranchCode)}`}
                      title="Vista previa del kiosco"
                      className="absolute left-0 top-0 h-[177.78%] w-[177.78%] origin-top-left scale-[.5625] border-0"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modal de crear/editar */}
      {modalCard !== false && (
        <CardModal
          card={modalCard}
          onClose={handleCloseModal}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
};
