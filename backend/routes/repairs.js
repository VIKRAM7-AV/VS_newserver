import express from "express"
import {Repair} from "../models/Repair.js"
const router = express.Router()

// Get all repairs
router.get("/", async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 })
    res.json(repairs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create repair
router.post("/", async (req, res) => {
  try {
    const repair = new Repair(req.body)
    const savedRepair = await repair.save()
    res.status(201).json(savedRepair)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update repair
router.put("/:id", async (req, res) => {
  try {
    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" })
    }
    res.json(repair)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete repair
router.delete("/:id", async (req, res) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id)
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" })
    }
    res.json({ message: "Repair deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


export default router;
