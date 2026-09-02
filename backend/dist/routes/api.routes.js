"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_controller_js_1 = require("../controllers/services.controller.js");
const tickets_controller_js_1 = require("../controllers/tickets.controller.js");
const analytics_controller_js_1 = require("../controllers/analytics.controller.js");
const kiosks_controller_js_1 = require("../controllers/kiosks.controller.js");
const connection_controller_js_1 = require("../controllers/connection.controller.js");
const config_controller_js_1 = require("../controllers/config.controller.js");
const router = (0, express_1.Router)();
// Rutas de Servicios
router.get('/services/active', services_controller_js_1.getActiveServices);
router.get('/services/all', services_controller_js_1.getAllServices);
router.post('/services', services_controller_js_1.createService);
router.put('/services/:id', services_controller_js_1.updateService);
router.patch('/services/:id/toggle', services_controller_js_1.toggleServiceStatus);
router.post('/services/check-connection', connection_controller_js_1.checkServiceConnection);
router.get('/config', config_controller_js_1.getAppConfig);
router.put('/config', config_controller_js_1.saveAppConfig);
// Rutas de Turnero / Tickets
router.post('/tickets', tickets_controller_js_1.createTicket);
router.get('/tickets/queue', tickets_controller_js_1.getQueueStatus);
router.post('/tickets/call-next', tickets_controller_js_1.callNextTicket);
router.patch('/tickets/:id/complete', tickets_controller_js_1.completeTicket);
router.patch('/tickets/:id/cancel', tickets_controller_js_1.cancelTicket);
// Rutas de Analítica y Métricas
router.get('/analytics/overview', analytics_controller_js_1.getDashboardOverview);
router.post('/analytics/log', analytics_controller_js_1.logUsage);
// Rutas de Monitor de Kioscos
router.get('/kiosks', kiosks_controller_js_1.getKiosks);
router.post('/kiosks', kiosks_controller_js_1.createKiosk);
router.post('/kiosks/heartbeat', kiosks_controller_js_1.kioskHeartbeat);
exports.default = router;
