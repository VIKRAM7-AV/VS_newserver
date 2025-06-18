import express from "express";
import { addProduct,allproducts, deleteProduct,singleProduct,updateProduct } from "../controllers/productController.js";
import adminRoute from "../middleware/adminRoute.js";

const router=express.Router();

router.post("/addproduct",adminRoute,addProduct);
router.get("/",adminRoute,allproducts);
router.get("/product/:id",adminRoute,singleProduct);
router.delete("/deleteproduct/:id",adminRoute,deleteProduct);
router.patch("/updateproduct/:id",adminRoute,updateProduct);

export default router;