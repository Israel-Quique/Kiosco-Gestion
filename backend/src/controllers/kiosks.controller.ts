import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { io } from '../index.js';

export async function getKiosks(req: Request, res: Response) {
  try {
    const kiosks = await prisma.kiosk.findMany({
      orderBy: { code: 'asc' },
    });
    res.json({ success: true, data: kiosks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener kioscos', error });
  }
}

export async function createKiosk(req: Request, res: Response) {
  const { code, name, location, ipAddress } = req.body;

  if (!code || !name || !location) {
    res.status(400).json({ success: false, message: 'Código, nombre y ubicación son obligatorios' });
    return;
  }

  try {
    const kiosk = await prisma.kiosk.create({
      data: { code, name, location, ipAddress: ipAddress || undefined },
    });
    res.status(201).json({ success: true, data: kiosk });
  } catch (error) {
    res.status(409).json({ success: false, message: 'No se pudo crear la sucursal', error });
  }
}

export async function kioskHeartbeat(req: Request, res: Response) {
  const { code, ipAddress } = req.body;

  try {
    const kiosk = await prisma.kiosk.upsert({
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

    if (io) {
      io.emit('kiosk:heartbeat', kiosk);
    }

    res.json({ success: true, data: kiosk });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar heartbeat', error });
  }
}

