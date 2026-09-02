import { io, Socket } from 'socket.io-client';
import { ServiceItem, TicketItem, QueueData, KioskItem, AnalyticsOverview } from '../types/index.js';

const API_BASE_URL = 'http://localhost:3001/api';

// Socket.io singleton
export const socket: Socket = io('http://localhost:3001', {
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

