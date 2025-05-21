import { Router } from 'express';
import { validateRfcController } from '../controllers/rfc.controller';

const router = Router();

router.post('/validate-rfc', validateRfcController);

export default router;
