"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKiosks = getKiosks;
exports.createKiosk = createKiosk;
exports.kioskHeartbeat = kioskHeartbeat;
const prisma_js_1 = require("../prisma.js");
const index_js_1 = require("../index.js");
async function getKiosks(req, res) {
    try {
        const kiosks = await prisma_js_1.prisma.kiosk.findMany({
            orderBy: { code: 'asc' },
        });
        res.json({ success: true, data: kiosks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener kioscos', error });
    }
}
async function createKiosk(req, res) {
    const { code, name, location, ipAddress } = req.body;
    if (!code || !name || !location) {
        res.status(400).json({ success: false, message: 'Código, nombre y ubicación son obligatorios' });
        return;
    }
    try {
        const kiosk = await prisma_js_1.prisma.kiosk.create({
            data: { code, name, location, ipAddress: ipAddress || undefined },
        });
        res.status(201).json({ success: true, data: kiosk });
    }
    catch (error) {
        res.status(409).json({ success: false, message: 'No se pudo crear la sucursal', error });
    }
}
async function kioskHeartbeat(req, res) {
    const { code, ipAddress } = req.body;
    try {
        const kiosk = await prisma_js_1.prisma.kiosk.upsert({
            where: { code },
            update: {
                lastHeartbeat: new Date(),
                isOnline: true,
                ipAddress: ipAddress || undefined,
            },
            create: {
                code,
                name: `Terminal ${code}`,
                location: 'Agencia Registrada',
                ipAddress,
                isOnline: true,
            },
        });
        if (index_js_1.io) {
            index_js_1.io.emit('kiosk:heartbeat', kiosk);
        }
        res.json({ success: true, data: kiosk });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar heartbeat', error });
    }
}
