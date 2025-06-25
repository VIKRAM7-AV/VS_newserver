import express from "express"
import { Repair } from "../models/Repair.js"
import { Equipment } from "../models/Equipment.js"
import mongoose from "mongoose"
const router = express.Router()

// Get all repairs
router.get("/", async (req, res) => {
  try {
    const repairs = await Repair.find().populate("equipmentName", "name").sort({ createdAt: -1 })
    res.json(repairs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create repair
router.post("/", async (req, res) => {
  try {
    console.log("Creating repair with data:", req.body);
    const { equipmentName: equipmentId, quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    // Check equipment availability
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    console.log("Equipment details:", {
      id: equipment._id,
      availableQuantity: equipment.availableQuantity,
      requestedQuantity: quantity,
    });

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({
        message: `Insufficient equipment quantity available. Requested: ${quantity}, Available: ${equipment.availableQuantity}`,
      });
    }

    const repair = new Repair(req.body);
    const savedRepair = await repair.save();

    // Update equipment availability
    equipment.availableQuantity -= quantity;
    await equipment.save();

    const populatedRepair = await Repair.findById(savedRepair._id)
      .populate("equipmentName", "name");

    res.status(201).json(populatedRepair);
  } catch (error) {
    console.error("Repair creation error:", error);
    res.status(400).json({ message: error.message || "Failed to create repair" });
  }
})

// Update repair
router.put("/:id", async (req, res) => {
  try {
    const existingRepair = await Repair.findById(req.params.id);
    if (!existingRepair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    const { equipmentName: equipmentId, quantity, equipmentUsed } = req.body;

    // Validate ObjectId if equipment is being updated
    if (equipmentId && !mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    // Handle equipment updates based on equipmentUsed
    if (equipmentId || quantity || typeof equipmentUsed !== "undefined") {
      const equipment = await Equipment.findById(equipmentId || existingRepair.equipmentName);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      // If equipmentUsed is false, reduce availableQuantity
      if (equipmentUsed === false && quantity) {
        const newQuantity = Number.parseInt(quantity, 10) || existingRepair.quantity;
        if (equipment.availableQuantity < newQuantity) {
          return res.status(400).json({
            message: `Insufficient equipment quantity available. Requested: ${newQuantity}, Available: ${equipment.availableQuantity}`,
          });
        }
        equipment.availableQuantity -= newQuantity;
      } else if (equipmentUsed === true && quantity) {
        const newQuantity = Number.parseInt(quantity, 10) || existingRepair.quantity;
        if (equipment.availableQuantity > newQuantity) {
          return res.status(400).json({
            message: `Insufficient equipment quantity available. Requested: ${newQuantity}, Available: ${equipment.availableQuantity}`,
          });
        }
        equipment.availableQuantity += newQuantity;
      }

      await equipment.save();
    }

    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("equipmentName", "name");

    return res.json(repair);
  } catch (error) {
    console.error("Repair update error:", error);
    return res.status(400).json({ message: error.message || "Failed to update repair" });
  }
});

// Delete repair
router.delete("/:id", async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    // Restore equipment availability
    const equipment = await Equipment.findById(repair.equipmentName);
    if (equipment) {
      equipment.availableQuantity += repair.quantity;
      await equipment.save();
    }

    await Repair.findByIdAndDelete(req.params.id);
    res.json({ message: "Repair deleted successfully" });
  } catch (error) {
    console.error("Repair deletion error:", error);
    res.status(500).json({ message: error.message || "Failed to delete repair" });
  }
})

export default router;