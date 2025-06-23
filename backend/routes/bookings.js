import express from "express"
import {Booking} from "../models/Booking.js"
import {Equipment} from "../models/Equipment.js"
const router = express.Router()

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("equipment", "name")
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create booking
router.post("/", async (req, res) => {
  try {
    const { equipment: equipmentId, quantity } = req.body

    // Check equipment availability
    const equipment = await Equipment.findById(equipmentId)
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" })
    }

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({ message: "Insufficient equipment quantity available" })
    }

    // Calculate totals
    const price = equipment.rentalAmount * req.body.duration * quantity
    const gstAmount = (price * (req.body.gst || 0)) / 100
    const subtotal = price
    const grandTotal = subtotal + gstAmount

    const booking = new Booking({
      ...req.body,
      price,
      subtotal,
      grandTotal,
    })

    const savedBooking = await booking.save()

    // Update equipment availability
    equipment.availableQuantity -= quantity
    await equipment.save()

    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name")

    res.status(201).json(populatedBooking)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update booking
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("customer", "name email phone")
      .populate("equipment", "name")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json(booking)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Restore equipment availability
    const equipment = await Equipment.findById(booking.equipment)
    if (equipment) {
      equipment.availableQuantity += booking.quantity
      await equipment.save()
    }

    await Booking.findByIdAndDelete(req.params.id)
    res.json({ message: "Booking deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router;
