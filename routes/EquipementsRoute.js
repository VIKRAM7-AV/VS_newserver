import express from "express";
import { getEquipements,equipements} from "../controllers/Equipementcontroller.js";
import projectmiddle from "../middleware/projectmiddle.js";
import adminRoute from "../middleware/adminRoute.js";
import protectRoute from "../middleware/protectRoute.js";


const router = express.Router();

router.get("/",adminRoute,getEquipements);
router.post("/transfer/:id",protectRoute,projectmiddle,equipements);

export default router;