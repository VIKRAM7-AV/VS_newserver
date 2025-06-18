import express from 'express';
import { signup,login,logout, getme } from '../controllers/authControllers.js';
import protectRoute from '../middleware/protectRoute.js';
import adminRoute from '../middleware/adminRoute.js';   

const router = express.Router();

router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',protectRoute,logout);
router.get('/getMe',adminRoute,protectRoute,getme)

export default router;