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
      .populate("equipment", "name rentalAmount availableQuantity")
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
    const { customer, deliveryDate, returnDate, duration, quantity, advanceAmount } = req.body;
    
    if (!customer || !deliveryDate || !returnDate || !duration || !quantity) {
      return res.status(400).json({ message: "Customer, delivery date, return date, duration, and quantity are required" });
    }
    const { equipment: equipmentId } = req.body;

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

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({
        message: `Insufficient equipment quantity available. Requested: ${quantity}, Available: ${equipment.availableQuantity}`,
      });
    }

    // Calculate totals
    const price = equipment.rentalAmount * duration * quantity;
    const gstAmount = (price * (req.body.gst || 0)) / 100;
    const subtotal = price;
    const grandTotal = subtotal + gstAmount;
    const remainingAmount = grandTotal - (advanceAmount || 0);

    const booking = new Booking({
      ...req.body,
      price,
      subtotal,
      grandTotal,
      advanceAmount: advanceAmount || 0,
      remainingAmount,
    });

    const savedBooking = await booking.save();

    // Update equipment availability
    equipment.availableQuantity -= quantity;
    await equipment.save();

    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name rentalAmount availableQuantity");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(400).json({ message: error.message || "Failed to create booking" });
  }
});

// Update booking
router.put("/:id", async (req, res) => {
  try {
    const prevBooking = await Booking.findById(req.params.id);
    if (!prevBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Restore previous quantity to equipment
    const prevEquipment = await Equipment.findById(prevBooking.equipment);
    if (prevEquipment) {
      prevEquipment.availableQuantity += prevBooking.quantity;
      await prevEquipment.save();
    }

    // Validate new equipment quantity
    const { equipment: equipmentId, quantity } = req.body;
    if (equipmentId && quantity) {
      const newEquipment = await Equipment.findById(equipmentId);
      if (!newEquipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      if (newEquipment.availableQuantity < quantity) {
        return res.status(400).json({
          message: `Insufficient equipment quantity available. Requested: ${quantity}, Available: ${newEquipment.availableQuantity}`,
        });
      }
      newEquipment.availableQuantity -= quantity;
      await newEquipment.save();
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("customer", "name email phone")
      .populate("equipment", "name rentalAmount availableQuantity");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Restore equipment availability
    const equipment = await Equipment.findById(booking.equipment);
    if (equipment) {
      equipment.availableQuantity += booking.quantity;
      await equipment.save();
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;