import express from 'express';
import projectmiddle from '../middleware/projectmiddle.js';
import adminRoute from "../middleware/adminRoute.js";
import { inboundStock,outboundStock,getallStock } from '../controllers/newstockController.js';

const router = express.Router();

router.post('/in/:id',projectmiddle,inboundStock);
router.post('/out/:id',projectmiddle,outboundStock);
router.get('/',adminRoute,getallStock);

export default router;