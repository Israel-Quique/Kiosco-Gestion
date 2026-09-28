"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const api_routes_js_1 = __importDefault(require("./routes/api.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '15mb' }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Rutas de la API
app.use('/api', api_routes_js_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'KIOSCO AGBC Backend', timestamp: new Date() });
});
// Manejo de conexiones WebSocket
exports.io.on('connection', (socket) => {
    console.log(`⚡ Cliente conectado a WebSocket: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
    console.log(`
  ======================================================
  🚀 KIOSCO AGBC Backend Activo
  📍 Servidor HTTP: http://localhost:${PORT}
  📡 WebSockets: Activo en puerto ${PORT}
  🗄️ API Base: http://localhost:${PORT}/api
  ======================================================
  `);
});
