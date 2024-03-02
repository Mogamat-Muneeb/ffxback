import mongoose from "mongoose";

const { Schema } = mongoose;

const resetTokenSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
      alias: "_id",
    },
    token: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
    used: { type: Boolean, default: false },
    email: { type: String },
    userId: { type: mongoose.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ResetToken ||
  mongoose.model("ResetToken", resetTokenSchema);
