import { Request, Response } from 'express';
import { getVmsUptimeHistory } from '../services/openstack-vms-uptime-history.service';

export async function vmsUptimeHistory(req: Request, res: Response) {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to (ISO date) are required as query params' });

    const result = await getVmsUptimeHistory({ from: new Date(from as string), to: new Date(to as string) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
