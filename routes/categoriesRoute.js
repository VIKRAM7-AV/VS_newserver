import express from "express"
import adminRoute from "../middleware/adminRoute.js"
import { addCategory,getAllCategories,deleteCategory,singleCategory} from "../controllers/categoryControllers.js"

const router = express.Router()

router.post('/addcategory',adminRoute,addCategory);
router.get("/",adminRoute,getAllCategories);
router.get('/category/:id',adminRoute,singleCategory)
router.delete("/deletecategory/:id",adminRoute,deleteCategory);

export default router