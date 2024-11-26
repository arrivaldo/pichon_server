import mongoose from "mongoose";
import { Schema } from "mongoose"

const leaveSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveType: {
        type: String,
        enum: ["Falla en la unidad", "Siniestro"],
        required: true,
    },
    startDate: { type: Date, required: true },
    economico: { type: String, required: true },
    reason: { type: String, required: true },
    images: [String], // This should match how you're storing image URLs
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;