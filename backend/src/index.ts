import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'KIOSCO AGBC Backend', timestamp: new Date() });
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
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

