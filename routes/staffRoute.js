import express from 'express';
import projectmiddle from '../middleware/projectmiddle.js';
import adminRoute from '../middleware/adminRoute.js';
import {addStaff,getAllStaff,getAllIdStaff,getIdStaff,Attenance,getstaffName} from '../controllers/staffController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/newstaff',projectmiddle,addStaff);
router.get('/getallstaff',adminRoute,getAllStaff);
router.get('/getstaff/:id',protectRoute,getAllIdStaff);
router.get('/staffs/:id',projectmiddle,getIdStaff);
router.post('/attendance/:id',projectmiddle,Attenance);
router.get('/staffname/:Name',projectmiddle,getstaffName);



export default router;