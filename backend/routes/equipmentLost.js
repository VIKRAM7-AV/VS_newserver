import express from "express"
import { EquipmentLost } from "../models/EquipmentLost.js"
import { Equipment } from "../models/Equipment.js"
import mongoose from "mongoose"
const router = express.Router()

// Get all lost equipment reports
router.get("/", async (req, res) => {
  try {
    const lostEquipment = await EquipmentLost.find().populate("equipment", "name").sort({ createdAt: -1 })
    res.json(lostEquipment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create lost equipment report
router.post("/", async (req, res) => {
  try {
    console.log("Creating lost equipment report with data:", req.body);
    const { equipment: equipmentId, quantity } = req.body;

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

    const lostEquipment = new EquipmentLost(req.body);
    const savedLostEquipment = await lostEquipment.save();

    // Update equipment availability
    equipment.availableQuantity -= quantity;
    await equipment.save();

    const populatedLostEquipment = await EquipmentLost.findById(savedLostEquipment._id)
      .populate("equipment", "name");

    res.status(201).json(populatedLostEquipment);
  } catch (error) {
    console.error("Lost equipment report creation error:", error);
    res.status(400).json({ message: error.message || "Failed to create lost equipment report" });
  }
})

// Update lost equipment report
router.put("/:id", async (req, res) => {
  try {
    const existingReport = await EquipmentLost.findById(req.params.id);
    if (!existingReport) {
      return res.status(404).json({ message: "Lost equipment report not found" });
    }

    const { equipment: equipmentId, quantity } = req.body;
    
    // Validate ObjectId if equipment is being updated
    if (equipmentId && !mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }

    // If quantity or equipment is being updated, manage availability
    if (quantity || equipmentId) {
      const equipment = await Equipment.findById(equipmentId || existingReport.equipment);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }

      // Restore previous quantity
      equipment.availableQuantity += existingReport.quantity;

      // Check new quantity availability
      const newQuantity = quantity || existingReport.quantity;
      if (equipment.availableQuantity < newQuantity) {
        return res.status(400).json({
          message: `Insufficient equipment quantity available. Requested: ${newQuantity}, Available: ${equipment.availableQuantity}`,
        });
      }

      // Update with new quantity
      equipment.availableQuantity -= newQuantity;
      await equipment.save();
    }

    const lostEquipment = await EquipmentLost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("equipment", "name");

    res.json(lostEquipment);
  } catch (error) {
    console.error("Lost equipment update error:", error);
    res.status(400).json({ message: error.message || "Failed to update lost equipment report" });
  }
})

// Delete lost equipment report
router.delete("/:id", async (req, res) => {
  try {
    const lostEquipment = await EquipmentLost.findById(req.params.id);
    if (!lostEquipment) {
      return res.status(404).json({ message: "Lost equipment report not found" });
    }

    // Restore equipment availability
    const equipment = await Equipment.findById(lostEquipment.equipment);
    if (equipment) {
      equipment.availableQuantity += lostEquipment.quantity;
      await equipment.save();
    }

    await EquipmentLost.findByIdAndDelete(req.params.id);
    res.json({ message: "Lost equipment report deleted successfully" });
  } catch (error) {
    console.error("Lost equipment deletion error:", error);
    res.status(500).json({ message: error.message || "Failed to delete lost equipment report" });
  }
})

export default router;