import express from 'express';
import projectmiddle from '../middleware/projectmiddle.js';
import adminRoute from '../middleware/adminRoute.js';
import { inboundEntry,outboundEntry,stockEntry,updateStockHistory,getProductStack,lastentry,singleProduct,getProductSite,stockproducts,AllProduct } from '../controllers/stockcontroller.js';

const router = express.Router();   

router.post('/inboundentry/:id',projectmiddle,inboundEntry);
router.post('/outboundentry/:id',projectmiddle,outboundEntry);
router.post('/stockentry/:id',projectmiddle,stockEntry);
router.patch('/updatestockhistory/:id/:index',adminRoute,updateStockHistory);
router.get('/lastentry',projectmiddle,lastentry);
router.get('/',projectmiddle,getProductStack);
router.get('/stockdata/:id',adminRoute,stockproducts);
router.get('/singleproduct/:id',adminRoute,singleProduct);
router.get('/all',adminRoute,AllProduct);
router.get('/:id',adminRoute,getProductSite);



export default router;