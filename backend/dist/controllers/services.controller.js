"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveServices = getActiveServices;
exports.getAllServices = getAllServices;
exports.updateService = updateService;
exports.toggleServiceStatus = toggleServiceStatus;
const prisma_js_1 = require("../prisma.js");
async function getActiveServices(req, res) {
    try {
        const services = await prisma_js_1.prisma.service.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
        });
        res.json({ success: true, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener servicios', error });
    }
}
async function getAllServices(req, res) {
    try {
        const services = await prisma_js_1.prisma.service.findMany({
            orderBy: { orderIndex: 'asc' },
        });
        res.json({ success: true, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener todos los servicios', error });
    }
}
async function updateService(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, url, icon, colorTheme, isActive, orderIndex } = req.body;
    try {
        const updated = await prisma_js_1.prisma.service.update({
            where: { id },
            data: {
                title,
                description,
                url,
                icon,
                colorTheme,
                isActive,
                orderIndex,
            },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar servicio', error });
    }
}
async function toggleServiceStatus(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const service = await prisma_js_1.prisma.service.findUnique({ where: { id } });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        }
        const updated = await prisma_js_1.prisma.service.update({
            where: { id },
            data: { isActive: !service.isActive },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al alternar estado del servicio', error });
    }
}
