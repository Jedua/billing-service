import { Router } from 'express';
import { vmsUptime } from '../controllers/openstack-vms.controller';

const router = Router();

router.get('/uptime', vmsUptime);

export default router;
