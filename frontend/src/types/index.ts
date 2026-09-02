export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  colorTheme: string;
  imageUrl: string;
  orderIndex: number;
  isActive: boolean;
}

export interface TicketItem {
  id: string;
  ticketNumber: string;
  category: string;
  serviceCode?: string | null;
  kioskCode: string;
  status: 'WAITING' | 'CALLED' | 'ATTENDED' | 'CANCELLED';
  windowNumber?: number | null;
  createdAt: string;
  calledAt?: string | null;
  completedAt?: string | null;
}

export interface QueueData {
  waiting: TicketItem[];
  called: TicketItem[];
  waitingCount: number;
  attendedCount: number;
}

export interface KioskItem {
  id: string;
  code: string;
  name: string;
  location: string;
  ipAddress?: string | null;
  isOnline: boolean;
  lastHeartbeat: string;
}

export interface AnalyticsOverview {
  summary: {
    totalTicketsToday: number;
    attendedToday: number;
    waitingNow: number;
    activeServicesCount: number;
    activeKiosksCount: number;
  };
  categoriesDistribution: Array<{
    category: string;
    count: number;
  }>;
  serviceMetrics: Array<{
    code: string;
    title: string;
    colorTheme: string;
    count: number;
  }>;
}

