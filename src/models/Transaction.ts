import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: string; // ID người dùng
  type: string; // Loại giao dịch (Thưởng, Tái mua,...)
  amount: number; // Số tiền giao dịch
  description?: string; // Ghi chú
  createdAt: Date; // Ngày giao dịch
}

const TransactionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['thưởng', 'tái mua', 'khác'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
