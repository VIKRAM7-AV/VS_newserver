import express from "express"
import { Customer } from "../models/Customer.js"
import { Equipment } from "../models/Equipment.js"
import { Booking } from "../models/Booking.js"

const router = express.Router()

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalCustomers,
      totalEquipment,
      totalBookings,
      totalIncomeResult,
      recentBookings,
      equipmentStatus
    ] = await Promise.all([
      Customer.countDocuments(),
      Equipment.countDocuments(),
      Booking.countDocuments(),

      // ✅ Only sum grandTotal for Completed bookings
      Booking.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]),

      Booking.find()
        .populate("customer", "name")
        .populate("equipment", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Equipment.find().limit(5),
    ])

    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0

    res.json({
      totalCustomers,
      totalEquipment,
      totalBookings,
      totalIncome, // ✅ Will now only include Completed bookings
      recentBookings,
      equipmentStatus,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
