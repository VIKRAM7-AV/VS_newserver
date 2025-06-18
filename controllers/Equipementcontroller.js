import Equipements from "../Models/EquipementsModel.js";
import Product from "../Models/productModel.js";

export const getEquipements = async (req, res) => {
    try {
        const equipements = await Equipements.find().populate({path:'EquipementsId'}).populate({path:'from'}).populate({path:'to'}).populate({path:'name'})
        if (!equipements) {
            return res.status(404).json({ message: "No equipements found" });
        }
        res.status(200).json(equipements);
        
    } catch (error) {
        console.log("Error in getEquipements:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const equipements=async (req, res) => {
    try {
        const {id} = req.params;
        console.log("ID:", id);
        const projectId = req.project;
        const equipment = await Product.findById(id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }
        const { to } = req.body;
        if(!to) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingEquipment = await Equipements.findOne({ EquipementsId: id });
        if (existingEquipment) {
            const lastUpdate = existingEquipment.from[existingEquipment.from.length - 1];
            if (lastUpdate.toString() === existingEquipment.from.toString()) {
                return res.status(400).json({ message: "You already transfer the equipment..." });
            }
            existingEquipment.from.push(projectId);
            existingEquipment.to.push(to);
            existingEquipment.name.push(req.user._id);
            existingEquipment.date.push(new Date());
            if(existingEquipment.from.toString() === existingEquipment.to.toString()){
                return res.status(400).json({ message: "You cannot transfer to the same project" });
            }
            await existingEquipment.save();
            res.status(200).json({ message: "Equipment transferred successfully" });
        }
        else {
            const newEquipement = new Equipements({
                EquipementsId: id,
                from: projectId,
                to: to,
                name: req.user._id,
                date: new Date()
            });
            await newEquipement.save();
            res.status(201).json({ message: "Equipment transferred successfully" });
        }
        
    } catch (error) {
        console.log("Error in equipements:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}