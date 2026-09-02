"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = getDashboardOverview;
exports.logUsage = logUsage;
const prisma_js_1 = require("../prisma.js");
async function getDashboardOverview(req, res) {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const totalTicketsToday = await prisma_js_1.prisma.ticket.count({
            where: { createdAt: { gte: startOfDay } },
        });
        const attendedToday = await prisma_js_1.prisma.ticket.count({
            where: {
                status: 'ATTENDED',
                createdAt: { gte: startOfDay },
            },
        });
        const waitingNow = await prisma_js_1.prisma.ticket.count({
            where: { status: 'WAITING' },
        });
        const activeServicesCount = await prisma_js_1.prisma.service.count({
            where: { isActive: true },
        });
        const activeKiosksCount = await prisma_js_1.prisma.kiosk.count({
            where: { isOnline: true },
        });
        // Distribución de tickets por categoría
        const categoriesGroup = await prisma_js_1.prisma.ticket.groupBy({
            by: ['category'],
            where: { createdAt: { gte: startOfDay } },
            _count: { id: true },
        });
        const categoriesDistribution = categoriesGroup.map((item) => ({
            category: item.category,
            count: item._count.id,
        }));
        // Métricas por servicio
        const services = await prisma_js_1.prisma.service.findMany({
            select: { code: true, title: true, colorTheme: true },
        });
        const serviceMetrics = await Promise.all(services.map(async (svc) => {
            const count = await prisma_js_1.prisma.usageMetric.count({
                where: { serviceCode: svc.code },
            });
            return {
                code: svc.code,
                title: svc.title,
                colorTheme: svc.colorTheme,
                count,
            };
        }));
        res.json({
            success: true,
            data: {
                summary: {
                    totalTicketsToday,
                    attendedToday,
                    waitingNow,
                    activeServicesCount,
                    activeKiosksCount,
                },
                categoriesDistribution,
                serviceMetrics,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener analítica', error });
    }
}
async function logUsage(req, res) {
    const { kioskCode = 'KIOSK-LPZ-01', serviceCode, actionType = 'SERVICE_OPEN' } = req.body;
    try {
        const metric = await prisma_js_1.prisma.usageMetric.create({
            data: {
                kioskCode,
                serviceCode: serviceCode || 'UNKNOWN',
                actionType,
            },
        });
        res.json({ success: true, data: metric });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar métrica', error });
    }
}
