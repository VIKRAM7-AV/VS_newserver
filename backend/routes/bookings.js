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
    console.error("Get bookings error:", error.message, error.stack)
    res.status(500).json({ message: error.message || "Failed to fetch bookings" })
  }
})

// Create booking
router.post("/", async (req, res) => {
  try {
    const { customer, deliveryDate, returnDate, duration, quantity, advanceAmount, status } = req.body;
    
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

    // Validate status if provided
    const validStatuses = ["Confirmed", "Pending", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Check equipment availability
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Only check availability for Confirmed status
    if (status === "Confirmed") {
      if (equipment.availableQuantity < quantity) {
        return res.status(400).json({
          message: `Insufficient equipment quantity available. Requested: ${quantity}, Available: ${equipment.availableQuantity}`,
        });
      }
      if (equipment.availableQuantity < 1 || equipment.availableQuantity < 3) {
        return res.status(400).json({
          message: `Equipment available quantity must be at least 1 or 3. Current: ${equipment.availableQuantity}`,
        });
      }
    }

    // Calculate totals
    const price = equipment.rentalAmount;
    const gstAmount = (price * (req.body.gst || 0)) / 100;
    const subtotal = price * duration * quantity;
    const grandTotal = subtotal + gstAmount;
    const remainingAmount = grandTotal - (advanceAmount || 0);

    const booking = new Booking({
      ...req.body,
      price,
      subtotal,
      grandTotal,
      advanceAmount: advanceAmount || 0,
      remainingAmount,
      status: status || "Confirmed",
    });

    const savedBooking = await booking.save();

    // Update equipment availability for Confirmed status
    if (status === "Confirmed") {
      equipment.availableQuantity -= quantity;
      await equipment.save();
    }

    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name rentalAmount availableQuantity");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Booking creation error:", error.message, error.stack);
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

    const { status, advanceAmount } = req.body;

    // Validate ObjectIds
    if (req.body.equipment && !mongoose.Types.ObjectId.isValid(req.body.equipment)) {
      return res.status(400).json({ message: "Invalid equipment ID" });
    }
    if (req.body.customer && !mongoose.Types.ObjectId.isValid(req.body.customer)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Validate status
    const validStatuses = ["Confirmed", "Pending", "Completed", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Handle status-only change to Completed or Cancelled
    if ((status === "Completed" || status === "Cancelled") && prevBooking.status === "Confirmed") {
      // Restore quantity if booking is now canceled or completed
      const prevEquipment = await Equipment.findById(prevBooking.equipment);
      if (!prevEquipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      prevEquipment.availableQuantity += prevBooking.quantity;
      await prevEquipment.save();
    }

    if (status === "Completed" || status === "Cancelled") {
      // Only update financial fields, not stock
      const updated = await Booking.findByIdAndUpdate(
        req.params.id,
        {
          status,
          advanceAmount: advanceAmount !== undefined ? parseFloat(advanceAmount) || 0 : prevBooking.advanceAmount,
          remainingAmount: prevBooking.grandTotal - (advanceAmount !== undefined ? parseFloat(advanceAmount) || 0 : prevBooking.advanceAmount),
        },
        { new: true, runValidators: true }
      )
        .populate("customer", "name email phone")
        .populate("equipment", "name rentalAmount availableQuantity");

      return res.json(updated);
    }

    // Full update if not status-only
    // Restore previous quantity if previous status was Confirmed
    if (prevBooking.status === "Confirmed") {
      const prevEquipment = await Equipment.findById(prevBooking.equipment);
      if (prevEquipment) {
        prevEquipment.availableQuantity += prevBooking.quantity;
        await prevEquipment.save();
      }
    }

    const { equipment: newEquipmentIdRaw, quantity } = req.body;
    const newEquipmentId = newEquipmentIdRaw || prevBooking.equipment;
    const quantityFinal = quantity !== undefined ? parseInt(quantity) : prevBooking.quantity;

    const newEquipment = await Equipment.findById(newEquipmentId);
    if (!newEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Only adjust quantity if status is Confirmed and it's a new confirmation
    if (status === "Confirmed" && prevBooking.status !== "Confirmed") {
      if (newEquipment.availableQuantity < quantityFinal) {
        return res.status(400).json({
          message: `Insufficient equipment quantity available. Requested: ${quantityFinal}, Available: ${newEquipment.availableQuantity}`,
        });
      }
      newEquipment.availableQuantity -= quantityFinal;
      await newEquipment.save();
    }

    const price = newEquipment.rentalAmount;
    const duration = req.body.duration || prevBooking.duration;
    const gst = parseFloat(req.body.gst) || prevBooking.gst || 0;
    const advanceAmountFinal = parseFloat(advanceAmount) || prevBooking.advanceAmount || 0;

    const subtotal = price * duration * quantityFinal;
    const gstAmount = (subtotal * gst) / 100;
    const grandTotal = subtotal + gstAmount;
    const remainingAmount = grandTotal - advanceAmountFinal;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        price,
        subtotal,
        grandTotal,
        advanceAmount: advanceAmountFinal,
        remainingAmount,
        status: status || prevBooking.status,
      },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email phone")
      .populate("equipment", "name rentalAmount availableQuantity");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Booking update error:", error.message, error.stack);
    res.status(400).json({ message: error.message || "Failed to update booking" });
  }
});

// Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Restore equipment availability if booking was Confirmed
    if (booking.status === "Confirmed") {
      const equipment = await Equipment.findById(booking.equipment);
      if (equipment) {
        equipment.availableQuantity += booking.quantity;
        await equipment.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Booking deletion error:", error.message, error.stack);
    res.status(500).json({ message: error.message || "Failed to delete booking" });
  }
});

export default router;