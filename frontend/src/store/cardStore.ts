export type CardStatus = 'activo' | 'inactivo' | 'borrador';
export type CardVista = 'kiosco' | 'admin' | 'ambos';

export interface KioskCard {
  id: string;
  nombre: string;
  imagen: string;
  url: string;
  vista: CardVista;
  estado: CardStatus;
  creadoEn: string;
}

export interface DesignConfig {
  visibleCardsCount: number;
  idleScreenEnabled: boolean;
}

const STORAGE_KEY = 'kiosco_agbc_cards';
const DESIGN_STORAGE_KEY = 'kiosco_agbc_design';
const DEFAULT_VISIBLE_CARDS = 6;

export const DEFAULT_CARDS: KioskCard[] = [
  {
    id: 'rastreo',
    nombre: 'RASTREO DE CORRESPONDENCIA',
    imagen: '/RASTREO.png',
    url: 'https://trackingbo.correos.gob.bo:8100/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-01',
  },
  {
    id: 'calculadora',
    nombre: 'CALCULADORA POSTAL',
    imagen: '/CALCULO.png',
    url: 'https://postar.correos.gob.bo:8104/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-01',
  },
  {
    id: 'reclamos',
    nombre: 'SISTEMA DE RECLAMOS',
    imagen: '/RECLAMO2.png',
    url: 'https://sireco.correos.gob.bo:8102/',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-01',
  },
  {
    id: 'preenvio',
    nombre: 'GENERAR PREENVIO',
    imagen: '/Preenvio.jpg',
    url: 'https://trackingbo.correos.gob.bo:8100/hacer-envio-desde-casa',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-01',
  },
  {
    id: 'aduana',
    nombre: 'KIOSCO ADUANA',
    imagen: '/DECLARACION2.png',
    url: 'https://ips.correos.gob.bo/CDS.Web/Operational/andeclaration.aspx',
    vista: 'kiosco',
    estado: 'activo',
    creadoEn: '2026-08-01',
  },
];

export function loadCards(): KioskCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;

    const parsed = JSON.parse(raw) as KioskCard[];
    return parsed.length > 0 ? parsed : DEFAULT_CARDS;
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: KioskCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getKioskCards(): KioskCard[] {
  return loadCards().filter(
    (card) => card.estado === 'activo' && (card.vista === 'kiosco' || card.vista === 'ambos'),
  );
}

export function loadDesignConfig(branchCode?: string): DesignConfig {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (!raw) return { visibleCardsCount: DEFAULT_VISIBLE_CARDS, idleScreenEnabled: true };

    const parsed = JSON.parse(raw) as Partial<DesignConfig> & Record<string, Partial<DesignConfig>>;
    const branchConfig = branchCode ? parsed[branchCode] : undefined;
    // Una sucursal nueva no debe heredar el estado de espera de otra sede.
    const config = branchCode ? (branchConfig || {}) : parsed;
    const count = Number(config.visibleCardsCount);
    const idleScreenEnabled = config.idleScreenEnabled !== false;

    if (!Number.isFinite(count)) {
      return { visibleCardsCount: DEFAULT_VISIBLE_CARDS, idleScreenEnabled };
    }

    return {
      visibleCardsCount: Math.min(Math.max(Math.trunc(count), 1), DEFAULT_VISIBLE_CARDS),
      idleScreenEnabled,
    };
  } catch {
    return { visibleCardsCount: DEFAULT_VISIBLE_CARDS, idleScreenEnabled: true };
  }
}

export function saveDesignConfig(config: DesignConfig, branchCode?: string): void {
  const visibleCardsCount = Math.min(Math.max(Math.trunc(config.visibleCardsCount), 1), DEFAULT_VISIBLE_CARDS);
  const idleScreenEnabled = config.idleScreenEnabled !== false;
  if (!branchCode) {
    localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify({ visibleCardsCount, idleScreenEnabled }));
    return;
  }

  let saved: Record<string, Partial<DesignConfig>> = {};
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Record<string, Partial<DesignConfig>> : {};
    saved = typeof parsed.visibleCardsCount === 'number' ? {} : parsed;
  } catch {
    saved = {};
  }

  saved[branchCode] = { visibleCardsCount, idleScreenEnabled };
  localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(saved));
}
