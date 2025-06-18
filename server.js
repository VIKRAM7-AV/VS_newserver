import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectDB from "./DB/connectDB.js"
import authRoute from "./routes/authRoute.js"
import categoriesRoute from "./routes/categoriesRoute.js"
import productRoute from "./routes/productRoute.js"
import siteRoute from "./routes/siteRoute.js"
import stockRoute from "./routes/stockRoute.js"
import newStockRoute from "./routes/newStockRoute.js"
import staffRoute from "./routes/staffRoute.js"
import cors from "cors"
import EquipementsRoute from "./routes/EquipementsRoute.js"
import cloudinary from "cloudinary"
const app =express();

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
})) 

//

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

dotenv.config();
app.use(cookieParser())
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

app.use("/api/v2/auth",authRoute)
app.use("/api/v2/categories",categoriesRoute)
app.use("/api/v2/products",productRoute)
app.use("/api/v2/site",siteRoute);
app.use("/api/v2/stock",stockRoute);
app.use('/api/v2/newstock',newStockRoute);
app.use('/api/v2/staff',staffRoute);
app.use('/api/v2/equipements',EquipementsRoute);

app.listen(process.env.PORT,()=>{
    console.log("Server is Running....");
    connectDB();
})
