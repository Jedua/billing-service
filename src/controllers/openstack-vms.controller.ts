import { Request, Response } from 'express';
import { getVmsUptime } from '../services/openstack-vms.service';

export async function vmsUptime(req: Request, res: Response) {
  try {
    const data = await getVmsUptime();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
