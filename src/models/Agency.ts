import mongoose, { Schema, Document } from "mongoose";

export interface IAgency extends Document {
  userId: mongoose.Types.ObjectId; // ID của người dùng
  rank: number; // Rank đại lý (Agency Level)
}

const AgencySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rank: { type: Number, default: 1 }
});

export default mongoose.model<IAgency>("Agency", AgencySchema);
