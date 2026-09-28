"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveServices = getActiveServices;
exports.getAllServices = getAllServices;
exports.createService = createService;
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
async function createService(req, res) {
    const { code, name, title, description, url, icon, colorTheme, imageUrl, orderIndex, isActive } = req.body;
    if (!code || !name || !title || !url) {
        return res.status(400).json({ success: false, message: 'Código, nombre, título y URL son obligatorios' });
    }
    try {
        const service = await prisma_js_1.prisma.service.create({
            data: {
                code, name, title, description: description || '', url, icon: icon || 'link',
                colorTheme: colorTheme || 'blue', imageUrl: imageUrl || '',
                orderIndex: Number(orderIndex) || 0, isActive: isActive !== false,
            },
        });
        res.status(201).json({ success: true, data: service });
    }
    catch (error) {
        res.status(409).json({ success: false, message: 'No se pudo crear el servicio', error });
    }
}
async function updateService(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, url, icon, colorTheme, imageUrl, isActive, orderIndex } = req.body;
    try {
        const updated = await prisma_js_1.prisma.service.update({
            where: { id },
            data: {
                title,
                description,
                url,
                icon,
                colorTheme,
                imageUrl,
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
