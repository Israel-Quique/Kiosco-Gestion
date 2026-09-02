import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export async function getActiveServices(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener servicios', error });
  }
}

export async function getAllServices(req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener todos los servicios', error });
  }
}

export async function updateService(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { title, description, url, icon, colorTheme, isActive, orderIndex } = req.body;

  try {
    const updated = await prisma.service.update({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar servicio', error });
  }
}

export async function toggleServiceStatus(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al alternar estado del servicio', error });
  }
}
