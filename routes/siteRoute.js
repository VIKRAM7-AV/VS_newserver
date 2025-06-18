import express from "express";
import adminRoute from "../middleware/adminRoute.js";
import { newProject,loginProject,deleteProject,getProject,getAllProjects,projectLogout,updateProject } from "../controllers/siteController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post('/newproject',adminRoute,newProject);
router.post('/loginproject',protectRoute,loginProject);
router.delete('/deleteproject/:id',adminRoute,deleteProject);
router.get('/getproject/:id',protectRoute,getProject);
router.patch('/updateproject/:id',adminRoute,updateProject); 
router.get('/',adminRoute,getAllProjects);
router.post('/logoutproject',protectRoute,projectLogout);



export default router;