import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: string; // ID người dùng
  type: string; // Loại giao dịch (Thưởng, Tái mua,...)
  amount: number; // Số tiền giao dịch
  description?: string; // Ghi chú
  referenceId?: string; // Tham chiếu đến ID khác (Order/Point/...)
  status: string; // Trạng thái giao dịch
  createdAt: Date; // Ngày giao dịch
  updatedAt?: Date; // Ngày cập nhật
}

const TransactionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['thưởng', 'tái mua', 'chia thưởng', 'nạp tiền', 'rút tiền', 'khác'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
