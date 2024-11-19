import mongoose, { Schema, Document } from 'mongoose';

export interface IUplineHistory extends Document {
  userId: string; // Người được tham chiếu
  uplineId: string; // Tuyến trên
  transactionId?: string; // Giao dịch liên quan
  createdAt: Date; // Ngày
}

const UplineHistorySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uplineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUplineHistory>('UplineHistory', UplineHistorySchema);
