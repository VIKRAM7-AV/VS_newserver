import express from "express"
import { Booking } from "../models/Booking.js"
import { Equipment } from "../models/Equipment.js"
import mongoose from "mongoose"
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
    console.log("Creating booking with data:", req.body);
    const { customer, deliveryDate, returnDate, duration } = req.body;
    if (!customer || !deliveryDate || !returnDate || !duration) {
      return res.status(400).json({ message: "Customer, delivery date, return date, and duration are required" });
    }
    const { equipment: equipmentId, quantity } = req.body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
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

    // Calculate totals
    const price = equipment.rentalAmount * req.body.duration * quantity;
    const gstAmount = (price * (req.body.gst || 0)) / 100;
    const subtotal = price;
    const grandTotal = subtotal + gstAmount;

    const booking = new Booking({
      ...req.body,
      price,
      subtotal,
      grandTotal,
    });

    const savedBooking = await booking.save();
    console.log("Saved booking:", savedBooking);

    // Update equipment availability
    equipment.availableQuantity -= quantity;
    await equipment.save();

    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Booking creation error:", error); // Detailed logging
    res.status(400).json({ message: error.message || "Failed to create booking" });
  }
});

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
