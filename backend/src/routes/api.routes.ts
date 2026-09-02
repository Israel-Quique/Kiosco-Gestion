import { Router } from 'express';
import {
  getActiveServices,
  getAllServices,
  createService,
  updateService,
  toggleServiceStatus,
} from '../controllers/services.controller.js';
import {
  createTicket,
  getQueueStatus,
  callNextTicket,
  completeTicket,
  cancelTicket,
} from '../controllers/tickets.controller.js';
import {
  getDashboardOverview,
  logUsage,
} from '../controllers/analytics.controller.js';
import {
  getKiosks,
  createKiosk,
  kioskHeartbeat,
} from '../controllers/kiosks.controller.js';
import { checkServiceConnection } from '../controllers/connection.controller.js';
import { getAppConfig, saveAppConfig } from '../controllers/config.controller.js';

const router = Router();

// Rutas de Servicios
router.get('/services/active', getActiveServices);
router.get('/services/all', getAllServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.patch('/services/:id/toggle', toggleServiceStatus);
router.post('/services/check-connection', checkServiceConnection);
router.get('/config', getAppConfig);
router.put('/config', saveAppConfig);

// Rutas de Turnero / Tickets
router.post('/tickets', createTicket);
router.get('/tickets/queue', getQueueStatus);
router.post('/tickets/call-next', callNextTicket);
router.patch('/tickets/:id/complete', completeTicket);
router.patch('/tickets/:id/cancel', cancelTicket);

// Rutas de Analítica y Métricas
router.get('/analytics/overview', getDashboardOverview);
router.post('/analytics/log', logUsage);

// Rutas de Monitor de Kioscos
router.get('/kiosks', getKiosks);
router.post('/kiosks', createKiosk);
router.post('/kiosks/heartbeat', kioskHeartbeat);

export default router;

