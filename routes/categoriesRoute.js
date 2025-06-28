import express from "express"
import adminRoute from "../middleware/adminRoute.js"
import { addCategory,getAllCategories,deleteCategory,singleCategory} from "../controllers/categoryControllers.js"
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router()

router.post('/addcategory',adminRoute,addCategory);
router.get("/",protectRoute,getAllCategories);
router.get('/category/:id',protectRoute,singleCategory)
router.delete("/deletecategory/:id",adminRoute,deleteCategory);

export default router