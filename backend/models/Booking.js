import mongoose from "mongoose"

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      default:0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Counter = mongoose.model("Counter", counterSchema);

bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "bookingId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.bookingId = `#BOOK-${String(counter.seq).padStart(3, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
