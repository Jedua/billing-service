// src/routes/invoice.routes.ts
import { Router } from 'express';
import { issueInvoice } from '../controllers/invoice.controller';

const router = Router();

// POST /api/invoice/issue
router.post('/issue', (req, res, next) => issueInvoice(req, res).catch(next));

export default router;
