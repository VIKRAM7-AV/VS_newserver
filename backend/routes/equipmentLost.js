import express from "express"
import {EquipmentLost} from "../models/EquipmentLost.js"
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
    const lostEquipment = new EquipmentLost(req.body)
    const savedLostEquipment = await lostEquipment.save()
    res.status(201).json(savedLostEquipment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update lost equipment report
router.put("/:id", async (req, res) => {
  try {
    const lostEquipment = await EquipmentLost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!lostEquipment) {
      return res.status(404).json({ message: "Lost equipment report not found" })
    }
    res.json(lostEquipment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete lost equipment report
router.delete("/:id", async (req, res) => {
  try {
    const lostEquipment = await EquipmentLost.findByIdAndDelete(req.params.id)
    if (!lostEquipment) {
      return res.status(404).json({ message: "Lost equipment report not found" })
    }
    res.json({ message: "Lost equipment report deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


export default router;
