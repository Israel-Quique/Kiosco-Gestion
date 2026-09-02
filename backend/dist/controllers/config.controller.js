"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppConfig = getAppConfig;
exports.saveAppConfig = saveAppConfig;
const prisma_js_1 = require("../prisma.js");
const CONFIG_ID = 'global';
async function getAppConfig(_req, res) {
    try {
        const config = await prisma_js_1.prisma.appConfig.upsert({
            where: { id: CONFIG_ID },
            update: {},
            create: { id: CONFIG_ID },
        });
        res.json({ success: true, data: config });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la configuración', error });
    }
}
async function saveAppConfig(req, res) {
    const { visibleCardsCount, idleScreenEnabled, idleTimeoutSeconds } = req.body;
    const count = Math.min(Math.max(Math.trunc(Number(visibleCardsCount) || 6), 1), 6);
    const timeout = Math.min(Math.max(Math.trunc(Number(idleTimeoutSeconds) || 90), 5), 3600);
    try {
        const config = await prisma_js_1.prisma.appConfig.upsert({
            where: { id: CONFIG_ID },
            update: { visibleCardsCount: count, idleScreenEnabled: idleScreenEnabled !== false, idleTimeoutSeconds: timeout },
            create: { id: CONFIG_ID, visibleCardsCount: count, idleScreenEnabled: idleScreenEnabled !== false, idleTimeoutSeconds: timeout },
        });
        res.json({ success: true, data: config });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al guardar la configuración', error });
    }
}
