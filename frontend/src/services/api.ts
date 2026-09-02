import { io, Socket } from 'socket.io-client';
import { ServiceItem, TicketItem, QueueData, KioskItem, AnalyticsOverview } from '../types/index.js';

const API_HOST = window.location.hostname || 'localhost';
const API_BASE_URL = `http://${API_HOST}:3001/api`;

export interface ConnectionCheck {
  ok: boolean;
  status: number | null;
  responseTimeMs: number;
  checkedAt: string;
  message?: string;
}

export interface AppConfig {
  visibleCardsCount: number;
  idleScreenEnabled: boolean;
  idleTimeoutSeconds: number;
}

// Socket.io singleton
export const socket: Socket = io(`http://${API_HOST}:3001`, {
  autoConnect: true,
  reconnection: true,
});

// API Helpers
export const api = {
  // Servicios
  async getActiveServices(): Promise<ServiceItem[]> {
    const res = await fetch(`${API_BASE_URL}/services/active`);
    const data = await res.json();
    return data.data;
  },

  async getAllServices(): Promise<ServiceItem[]> {
    const res = await fetch(`${API_BASE_URL}/services/all`);
    const data = await res.json();
    return data.data;
  },

  async createService(input: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo crear el servicio');
    return data.data;
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.data;
  },

  async toggleService(id: string): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE_URL}/services/${id}/toggle`, {
      method: 'PATCH',
    });
    const data = await res.json();
    return data.data;
  },

  async checkServiceConnection(url: string): Promise<ConnectionCheck> {
    const res = await fetch(`${API_BASE_URL}/services/check-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo verificar la conexión');
    return data.data;
  },

  async getConfig(): Promise<AppConfig> {
    const res = await fetch(`${API_BASE_URL}/config`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo cargar la configuración');
    return data.data;
  },

  async saveConfig(config: AppConfig): Promise<AppConfig> {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo guardar la configuración');
    return data.data;
  },

  // Tickets / Turnero
  async createTicket(category: string, serviceCode?: string): Promise<TicketItem> {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, serviceCode, kioskCode: 'KIOSK-LPZ-01' }),
    });
    const data = await res.json();
    return data.data;
  },

  async getQueueStatus(): Promise<QueueData> {
    const res = await fetch(`${API_BASE_URL}/tickets/queue`);
    const data = await res.json();
    return data.data;
  },

  async callNextTicket(windowNumber: number, category?: string): Promise<TicketItem> {
    const res = await fetch(`${API_BASE_URL}/tickets/call-next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ windowNumber, category }),
    });
    const data = await res.json();
    return data.data;
  },

  async completeTicket(id: string): Promise<TicketItem> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/complete`, {
      method: 'PATCH',
    });
    const data = await res.json();
    return data.data;
  },

  async cancelTicket(id: string): Promise<TicketItem> {
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/cancel`, {
      method: 'PATCH',
    });
    const data = await res.json();
    return data.data;
  },

  // Analítica
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`);
    const data = await res.json();
    return data.data;
  },

  async logUsage(serviceCode: string, actionType: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/analytics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kioskCode: 'KIOSK-LPZ-01',
          serviceCode,
          actionType,
        }),
      });
    } catch (e) {
      console.warn('No se pudo registrar log:', e);
    }
  },

  // Kioscos
  async getKiosks(): Promise<KioskItem[]> {
    const res = await fetch(`${API_BASE_URL}/kiosks`);
    const data = await res.json();
    return data.data;
  },

  async createKiosk(input: Pick<KioskItem, 'code' | 'name' | 'location'>): Promise<KioskItem> {
    const res = await fetch(`${API_BASE_URL}/kiosks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo crear la sucursal');
    return data.data;
  },
};

