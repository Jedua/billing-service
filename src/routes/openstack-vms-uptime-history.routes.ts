import { Router } from 'express';
import { vmsUptimeHistory } from '../controllers/openstack-vms-uptime-history.controller';

const router = Router();
router.get('/uptime-history', vmsUptimeHistory);

export default router;
