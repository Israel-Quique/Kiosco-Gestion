"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.getQueueStatus = getQueueStatus;
exports.callNextTicket = callNextTicket;
exports.completeTicket = completeTicket;
exports.cancelTicket = cancelTicket;
const prisma_js_1 = require("../prisma.js");
const index_js_1 = require("../index.js");
async function createTicket(req, res) {
    const { category = 'GENERAL', serviceCode = null, kioskCode = 'KIOSK-LPZ-01' } = req.body;
    try {
        // Generar prefijo según categoría
        const prefixMap = {
            GENERAL: 'A',
            VENTANILLA: 'A',
            ENCOMIENDAS: 'E',
            CAJAS: 'C',
            RECLAMOS: 'R',
            PREENVIO: 'P',
        };
        const prefix = prefixMap[category.toUpperCase()] || 'A';
        // Obtener la cantidad de tickets de hoy para correlativo
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const countToday = await prisma_js_1.prisma.ticket.count({
            where: {
                createdAt: { gte: startOfDay },
                ticketNumber: { startsWith: `${prefix}-` }
            }
        });
        const ticketNumber = `${prefix}-${String(countToday + 1).padStart(3, '0')}`;
        const newTicket = await prisma_js_1.prisma.ticket.create({
            data: {
                ticketNumber,
                category: category.toUpperCase(),
                serviceCode,
                kioskCode,
                status: 'WAITING',
            }
        });
        // Registrar métrica de uso
        await prisma_js_1.prisma.usageMetric.create({
            data: {
                kioskCode,
                serviceCode: serviceCode || 'TICKET_HUB',
                actionType: 'TICKET_PRINT',
            }
        });
        // Emitir evento a todos los clientes conectados (pantalla de turnos y admin)
        if (index_js_1.io) {
            index_js_1.io.emit('ticket:created', newTicket);
        }
        res.status(201).json({ success: true, data: newTicket });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al emitir ticket', error });
    }
}
async function getQueueStatus(req, res) {
    try {
        const waiting = await prisma_js_1.prisma.ticket.findMany({
            where: { status: 'WAITING' },
            orderBy: { createdAt: 'asc' },
        });
        const called = await prisma_js_1.prisma.ticket.findMany({
            where: { status: 'CALLED' },
            orderBy: { calledAt: 'desc' },
            take: 6,
        });
        const attendedToday = await prisma_js_1.prisma.ticket.count({
            where: {
                status: 'ATTENDED',
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        });
        res.json({
            success: true,
            data: {
                waiting,
                called,
                waitingCount: waiting.length,
                attendedCount: attendedToday,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener estado de colas', error });
    }
}
async function callNextTicket(req, res) {
    const { windowNumber = 1, category = null } = req.body;
    try {
        const whereClause = { status: 'WAITING' };
        if (category) {
            whereClause.category = category.toUpperCase();
        }
        const nextTicket = await prisma_js_1.prisma.ticket.findFirst({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
        });
        if (!nextTicket) {
            return res.status(404).json({ success: false, message: 'No hay tickets en espera' });
        }
        const updated = await prisma_js_1.prisma.ticket.update({
            where: { id: nextTicket.id },
            data: {
                status: 'CALLED',
                windowNumber: Number(windowNumber),
                calledAt: new Date(),
            },
        });
        // Notificar en tiempo real a la sala de espera y operadores
        if (index_js_1.io) {
            index_js_1.io.emit('ticket:called', updated);
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al llamar ticket', error });
    }
}
async function completeTicket(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const updated = await prisma_js_1.prisma.ticket.update({
            where: { id },
            data: {
                status: 'ATTENDED',
                completedAt: new Date(),
            },
        });
        if (index_js_1.io) {
            index_js_1.io.emit('ticket:completed', updated);
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al completar ticket', error });
    }
}
async function cancelTicket(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const updated = await prisma_js_1.prisma.ticket.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        if (index_js_1.io) {
            index_js_1.io.emit('ticket:cancelled', updated);
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al cancelar ticket', error });
    }
}
