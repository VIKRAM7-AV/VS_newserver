import express from "express"
import {Equipment} from "../models/Equipment.js"
const router = express.Router()

// Get all equipment
router.get("/", async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 })
    res.json(equipment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create equipment
router.post("/", async (req, res) => {
  try {
    const equipment = new Equipment(req.body)
    const savedEquipment = await equipment.save()
    res.status(201).json(savedEquipment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update equipment
router.put("/:id", async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" })
    }
    res.json(equipment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete equipment
router.delete("/:id", async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id)
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" })
    }
    res.json({ message: "Equipment deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


export default router;
