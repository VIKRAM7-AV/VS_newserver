import express from "express"
import {Customer} from "../models/Customer.js"
import {Booking} from "../models/Booking.js"
const router = express.Router()

// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get customer by ID with rental details
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Get current rentals (active bookings)
    const currentRentals = await Booking.find({
      customer: req.params.id,
      status: { $in: ["Confirmed", "Pending"] },
    }).populate("equipment", "name")

    // Get rental history (completed bookings)
    const rentalHistory = await Booking.find({
      customer: req.params.id,
      status: "Completed",
    }).populate("equipment", "name")

    // Calculate totals
    const totalEquipmentRented = currentRentals.length
    const totalPaidAmount = rentalHistory.reduce((sum, booking) => sum + booking.grandTotal, 0)
    const remainingAmount = currentRentals.reduce((sum, booking) => sum + booking.grandTotal, 0)

    res.json({
      ...customer.toObject(),
      currentRentals,
      rentalHistory,
      totalEquipmentRented,
      totalPaidAmount,
      remainingAmount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create customer
router.post("/", async (req, res) => {
  try {
    const customer = new Customer(req.body)
    const savedCustomer = await customer.save()
    res.status(201).json(savedCustomer)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Email already exists" })
    } else {
      res.status(400).json({ message: error.message })
    }
  }
})

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(customer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json({ message: "Customer deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


export default router;
