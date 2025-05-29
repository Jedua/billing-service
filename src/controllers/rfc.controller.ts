import { Request, Response } from 'express';
import { validateRfc } from '../services/rfc.service';

export const validateRfcController = async (req: Request, res: Response) => {
  const { rfc } = req.body;
  if (!rfc) return res.status(400).json({ message: 'RFC requerido.' });

  try {
    const result = await validateRfc(rfc);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};