import jwt from 'jsonwebtoken';
import User from "../Models/userModel.js";

const adminRoute = async (req, res, next) => {
    try {
        const Token = req.cookies.token;
        if (!Token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        const decoded= jwt.verify(Token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
        const user = await User.findOne({ _id:decoded.id }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log("Error in adminRoute middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default adminRoute;