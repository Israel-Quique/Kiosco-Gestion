import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { io } from '../index.js';

export async function createTicket(req: Request, res: Response) {
  const { category = 'GENERAL', serviceCode = null, kioskCode = 'KIOSK-LPZ-01' } = req.body;

  try {
    // Generar prefijo según categoría
    const prefixMap: Record<string, string> = {
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

    const countToday = await prisma.ticket.count({
      where: {
        createdAt: { gte: startOfDay },
        ticketNumber: { startsWith: `${prefix}-` }
      }
    });

    const ticketNumber = `${prefix}-${String(countToday + 1).padStart(3, '0')}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        category: category.toUpperCase(),
        serviceCode,
        kioskCode,
        status: 'WAITING',
      }
    });

    // Registrar métrica de uso
    await prisma.usageMetric.create({
      data: {
        kioskCode,
        serviceCode: serviceCode || 'TICKET_HUB',
        actionType: 'TICKET_PRINT',
      }
    });

    // Emitir evento a todos los clientes conectados (pantalla de turnos y admin)
    if (io) {
      io.emit('ticket:created', newTicket);
    }

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al emitir ticket', error });
  }
}

export async function getQueueStatus(req: Request, res: Response) {
  try {
    const waiting = await prisma.ticket.findMany({
      where: { status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
    });

    const called = await prisma.ticket.findMany({
      where: { status: 'CALLED' },
      orderBy: { calledAt: 'desc' },
      take: 6,
    });

    const attendedToday = await prisma.ticket.count({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estado de colas', error });
  }
}

export async function callNextTicket(req: Request, res: Response) {
  const { windowNumber = 1, category = null } = req.body;

  try {
    const whereClause: any = { status: 'WAITING' };
    if (category) {
      whereClause.category = category.toUpperCase();
    }

    const nextTicket = await prisma.ticket.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    if (!nextTicket) {
      return res.status(404).json({ success: false, message: 'No hay tickets en espera' });
    }

    const updated = await prisma.ticket.update({
      where: { id: nextTicket.id },
      data: {
        status: 'CALLED',
        windowNumber: Number(windowNumber),
        calledAt: new Date(),
      },
    });

    // Notificar en tiempo real a la sala de espera y operadores
    if (io) {
      io.emit('ticket:called', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al llamar ticket', error });
  }
}

export async function completeTicket(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'ATTENDED',
        completedAt: new Date(),
      },
    });

    if (io) {
      io.emit('ticket:completed', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al completar ticket', error });
  }
}

export async function cancelTicket(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    if (io) {
      io.emit('ticket:cancelled', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cancelar ticket', error });
  }
}
