import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

const CONFIG_ID = 'global';

export async function getAppConfig(_req: Request, res: Response) {
  try {
    const config = await prisma.appConfig.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la configuración', error });
  }
}

export async function saveAppConfig(req: Request, res: Response) {
  const { visibleCardsCount, idleScreenEnabled, idleTimeoutSeconds } = req.body as {
    visibleCardsCount?: number;
    idleScreenEnabled?: boolean;
    idleTimeoutSeconds?: number;
  };
  const count = Math.min(Math.max(Math.trunc(Number(visibleCardsCount) || 6), 1), 6);
  const timeout = Math.min(Math.max(Math.trunc(Number(idleTimeoutSeconds) || 90), 5), 3600);

  try {
    const config = await prisma.appConfig.upsert({
      where: { id: CONFIG_ID },
      update: { visibleCardsCount: count, idleScreenEnabled: idleScreenEnabled !== false, idleTimeoutSeconds: timeout },
      create: { id: CONFIG_ID, visibleCardsCount: count, idleScreenEnabled: idleScreenEnabled !== false, idleTimeoutSeconds: timeout },
    });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la configuración', error });
  }
}