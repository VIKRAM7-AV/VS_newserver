import Project from "../Models/projectModel.js";
import bcrypt from "bcryptjs";
import projectToken from "../utils/projectToken.js";
import StackData from "../Models/stockModel.js";

export const newProject=async (req, res) => {
    try {
    const {siteId,password,sitePassword, location, description} = req.body;
    if (!siteId || !sitePassword || !location || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const project = await Project.findOne({ siteId });
    if (project) {
        return res.status(400).json({ message: "Project already exists" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sitePassword, salt);

    const newProject = new Project({
        siteId,
        sitePassword: hashedPassword,
        password: sitePassword,
        location,
        description,
    });

    projectToken(newProject._id, res);
    await newProject.save();
    res.status(201).json({ message: "Project created successfully" });    
        
    } catch (error) {
        console.log("Error in new Project", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const loginProject=async (req, res) => {
    try {
        const { siteId, sitePassword } = req.body;
        if (!siteId || !sitePassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const project = await Project.findOne({ siteId });
        if (!project) {
            return res.status(400).json({ message: "Project not found" });
        }
        
        const isMatch = await bcrypt.compare(sitePassword, project.sitePassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        projectToken(project._id, res);
        res.status(200).json({ message: "Login successful", project });
        
    } catch (error) {
        console.log("Error in login Project", error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}

export const deleteProject=async (req, res) => {
    try {
        const {id}= req.params;
        const project = await Project.findById({_id:id});
        if (!project) {
            return res.status(400).json({ message: "Project not found" });
        }
        const stockData= await StackData.findOne({siteId:id});
        if(stockData){
            await StackData.deleteOne({siteId:id});
        }
        await Project.findByIdAndDelete({_id:id});
        res.status(200).json({ message: "Project deleted successfully" });
        
    } catch (error) {
        console.log("Error in delete Project", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getProject=async (req, res) => {
    try {
        const {id}= req.params;
        const project = await Project.findById({_id:id});
        if (!project) {
            return res.status(400).json({ message: "Project not found" });
        }
        res.status(200).json({ message: "Project fetched successfully", project });
        
    } catch (error) {
        console.log("Error in get Project", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const getAllProjects=async(req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        if (!projects) {
            return res.status(400).json({ message: "No projects found" });
        }
        res.status(200).json({ message: "Projects fetched successfully", projects });
        
    } catch (error) {
        console.log("Error in get All Projects", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const projectLogout=async (req, res) => {
    try {
        res.cookie("project","",{maxAge:0});
        res.status(200).json({ message: "Project logged out successfully" });
        
    } catch (error) {
        console.log("Error in project Logout", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProject=async(req,res)=>{
    try {
        const {id}= req.params;
        const {status} = req.body;
        const project = await Project.findById({_id:id});
        if (!project) {
            return res.status(400).json({ message: "Project not found" });
        }
        const updatedProject = await Project.findByIdAndUpdate(
            {_id:id},
            {status:status},
            {new:true}
        );
        await updatedProject.save();
        res.status(200).json({ message: "Project updated successfully", updatedProject });
        
    } catch (error) {
        console.log("Error in update Project", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
