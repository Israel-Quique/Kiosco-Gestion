import { Request, Response } from 'express';

export async function checkServiceConnection(req: Request, res: Response) {
  const { url } = req.body as { url?: string };

  if (!url) {
    return res.status(400).json({ success: false, message: 'La URL es obligatoria' });
  }

  let target: URL;
  try {
    target = new URL(url);
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Protocolo no permitido');
  } catch {
    return res.status(400).json({ success: false, message: 'La URL no es válida' });
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response = await fetch(target, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    if (response.status === 405) {
      response = await fetch(target, { method: 'GET', signal: controller.signal, redirect: 'follow' });
    }

    return res.json({
      success: true,
      data: {
        ok: response.ok,
        status: response.status,
        responseTimeMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.json({
      success: true,
      data: {
        ok: false,
        status: null,
        responseTimeMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
        message: error instanceof Error && error.name === 'AbortError' ? 'Tiempo de espera agotado' : 'No se pudo conectar',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}