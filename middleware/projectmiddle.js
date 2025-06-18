import jwt from "jsonwebtoken";
import Project from "../Models/projectModel.js";

const projectMiddle=async(req, res, next) => {
    try {
        const projectMiddleware = req.cookies.project;
        if (!projectMiddleware) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(projectMiddleware, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized Token" });
        }
        const project =await Project.findOne({ _id: decoded.id }).select("-sitePassword");
        if (!project) {
            return res.status(401).json({ message: "Unauthorized Project" });
        }
        req.project = project;
        next()
        
    } catch (error) {
        console.log("Error in project middleware", error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}

export default projectMiddle;