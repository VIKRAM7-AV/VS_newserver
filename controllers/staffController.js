import Staff from '../Models/staffModel.js';
import Project from '../Models/projectModel.js';

export const addStaff = async (req, res) => {
    try {
        const project= req.project;
        const projectId=await Project.findOne({_id:project});
        if (!projectId) {
            return res.status(404).json({ message: "Project not found" });
        }
        const { Name, Age, PhoneNo, jobrole} = req.body;
        if(!Name || !Age || !PhoneNo || !jobrole) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingName = await Staff.findOne({Name, site: projectId._id});
        if (existingName) {
            return res.status(404).json({ message: "Staff Name is Already exist.." });
        }
        
        const staff = new Staff({
            Name,
            Age,
            PhoneNo,
            jobrole,
            site: projectId._id
        });
        await staff.save();
        res.status(201).json({ message: "Staff added successfully", staff });
        
    } catch (error) {
        console.log("Error in addStaff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllStaff = async (req, res) => {
    try {
        const getstaff = await Staff.find().sort({ createdAt: -1 }).populate('site')
        if (!getstaff) {
            return res.status(404).json({ message: "No staff found" });
        }
        res.status(200).json({ message: "Staff retrieved successfully", getstaff });
    } catch (error) {
        console.log("Error in getAllStaff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllIdStaff = async (req, res) => {
    try {
        const {id} = req.params;
        const project=await Project.findById({_id:id});
        if(!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const staff=await Staff.find({site:project._id}).sort({ createdAt: -1 });
        if(!staff) {
            return res.status(404).json({ message: "No staff found" });
        }
        res.status(200).json({ message: "Staff retrieved successfully", staff });
    } catch (error) {
        console.log("Error in getAllIdStaff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getIdStaff = async (req, res) => {
    try {
        const {id} = req.params;
        const project=await Project.findById({_id:id});
        if(!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        const projectId=req.project;
        if(projectId._id.toString() !== id.toString()) {
            return res.status(403).json({ message: "You are not authorized to access this project" });
        }
        const staff=await Staff.find({site:project._id}).sort({ createdAt: -1 });
        if(!staff) {
            return res.status(404).json({ message: "No staff found" });
        }
        res.status(200).json({ message: "Staff retrieved successfully", staff });
    } catch (error) {
        console.log("Error in getAllIdStaff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const Attenance =async (req, res) => {
    try {
        const {id} = req.params;
        const {Attenance} = req.body;
        const StaffId=await Staff.findById({_id:id});
        if(!StaffId) {
            return res.status(404).json({ message: "Staff not found" });
        }
        const project=req.project;
        if(StaffId.site.toString() !== project._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to access this staff" });
        }
        if(Attenance === "Present") {
            StaffId.presentDate.push(new Date());
        }
        if(Attenance === "Absent") {
            StaffId.absentDate.push(new Date());
        }
        await StaffId.save();
        res.status(200).json({ message: "Attendance updated successfully", StaffId });
        
    } catch (error) {
        console.log("Error in Attenance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getstaffName = async (req, res) => {
    try {
        const {Name}=req.params;
        const staff=await Staff.findOne({Name, site:req.project._id});
        if(!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        const project=req.project;
        if(staff.site.toString() !== project._id.toString()) {
            return res.status(403).json({ message: "Your Site Staff not found" });
        }
        res.status(200).json({ message: "Staff retrieved successfully", staff });
        
    } catch (error) {
        console.log("Error in getstaffName:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}