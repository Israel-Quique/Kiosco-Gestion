import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalTicketsToday = await prisma.ticket.count({
      where: { createdAt: { gte: startOfDay } },
    });

    const attendedToday = await prisma.ticket.count({
      where: {
        status: 'ATTENDED',
        createdAt: { gte: startOfDay },
      },
    });

    const waitingNow = await prisma.ticket.count({
      where: { status: 'WAITING' },
    });

    const activeServicesCount = await prisma.service.count({
      where: { isActive: true },
    });

    const activeKiosksCount = await prisma.kiosk.count({
      where: { isOnline: true },
    });

    // Distribución de tickets por categoría
    const categoriesGroup = await prisma.ticket.groupBy({
      by: ['category'],
      where: { createdAt: { gte: startOfDay } },
      _count: { id: true },
    });

    const categoriesDistribution = categoriesGroup.map((item) => ({
      category: item.category,
      count: item._count.id,
    }));

    // Métricas por servicio
    const services = await prisma.service.findMany({
      select: { code: true, title: true, colorTheme: true },
    });

    const serviceMetrics = await Promise.all(
      services.map(async (svc) => {
        const count = await prisma.usageMetric.count({
          where: { serviceCode: svc.code },
        });
        return {
          code: svc.code,
          title: svc.title,
          colorTheme: svc.colorTheme,
          count,
        };
      })
    );

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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener analítica', error });
  }
}

export async function logUsage(req: Request, res: Response) {
  const { kioskCode = 'KIOSK-LPZ-01', serviceCode, actionType = 'SERVICE_OPEN' } = req.body;

  try {
    const metric = await prisma.usageMetric.create({
      data: {
        kioskCode,
        serviceCode: serviceCode || 'UNKNOWN',
        actionType,
      },
    });
    res.json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar métrica', error });
  }
}

