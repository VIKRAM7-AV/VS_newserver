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

import dashboard from "./backend/routes/dashboard.js"
import customers from "./backend/routes/customers.js"
import equipment from "./backend/routes/equipment.js"
import bookings from "./backend/routes/bookings.js"
import repairs from "./backend/routes/repairs.js"
import equipmentLost from "./backend/routes/equipmentLost.js"

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // No origin (like mobile apps or curl) allow cheyyum
        if (!origin) return callback(null, true);
        
        // Allowed origins list - production + local dev ku
        const allowedOrigins = [
            "https://vs-new.vercel.app",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://192.168.0.11:3001"
        ];
        
        // Origin allowed ah check pannum
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            const msg = "CORS policy ithu origin allow pannala.";
            return callback(new Error(msg), false);
        }
    },
    credentials: true
})) 

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

//equipments Rental
app.use("/api/rent/dashboard",dashboard)
app.use("/api/rent/customers",customers)
app.use("/api/rent/equipment",equipment)
app.use("/api/rent/bookings",bookings)
app.use("/api/rent/repairs", repairs)
app.use("/api/rent/equipment-lost",equipmentLost)

app.listen(process.env.PORT,()=>{
    console.log("Server is Running....");
    connectDB();
})
