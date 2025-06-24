import mongoose from "mongoose";

const repairSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    equipmentUsed: {
      type: Boolean,
      default: false,
    },
    returnDate: {
      type: Date,
    },
    assignedUser: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Repair = mongoose.model("Repair", repairSchema)
