import type { KioskItem } from '../types/index.js';

const ACTIVE_BRANCH_KEY = 'kiosco_agbc_active_branch';
const BRANCHES_KEY = 'kiosco_agbc_branches';

export const DEFAULT_BRANCHES: KioskItem[] = [
  { id: 'central-lapaz', code: 'KIOSK-LPZ-01', name: 'Central - La Paz', location: 'La Paz', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'el-alto', code: 'KIOSK-EAL-01', name: 'El Alto', location: 'La Paz', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-tarija', code: 'KIOSK-TJA-01', name: 'Regional - Tarija', location: 'Tarija', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-beni', code: 'KIOSK-BEN-01', name: 'Regional - Beni', location: 'Beni', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-cochabamba', code: 'KIOSK-CBB-01', name: 'Regional - Cochabamba', location: 'Cochabamba', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-oruro', code: 'KIOSK-ORU-01', name: 'Regional - Oruro', location: 'Oruro', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-pando', code: 'KIOSK-PAN-01', name: 'Regional - Pando', location: 'Pando', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-potosi', code: 'KIOSK-POT-01', name: 'Regional - Potosi', location: 'Potosi', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-santa-cruz', code: 'KIOSK-SCZ-01', name: 'Regional - Santa Cruz', location: 'Santa Cruz', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'regional-sucre', code: 'KIOSK-SUC-01', name: 'Regional - Sucre', location: 'Chuquisaca', isOnline: true, lastHeartbeat: new Date().toISOString() },
  { id: 'viru-viru', code: 'KIOSK-VVI-01', name: 'Viru Viru', location: 'Santa Cruz', isOnline: true, lastHeartbeat: new Date().toISOString() },
];

export function loadActiveBranchCode(): string {
  return localStorage.getItem(ACTIVE_BRANCH_KEY) || DEFAULT_BRANCHES[0].code;
}

export function saveActiveBranchCode(code: string): void {
  localStorage.setItem(ACTIVE_BRANCH_KEY, code);
}

export function loadBranches(): KioskItem[] {
  try {
    const raw = localStorage.getItem(BRANCHES_KEY);
    if (!raw) return DEFAULT_BRANCHES;
    const saved = JSON.parse(raw) as KioskItem[];
    return saved.length > 0 ? saved : DEFAULT_BRANCHES;
  } catch {
    return DEFAULT_BRANCHES;
  }
}

export function saveBranches(branches: KioskItem[]): void {
  localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
}
