import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: string; // ID của thành viên
  type: string; // Loại ví (tiền hàng, đồng chia, cấp bậc, đại lý,...)
  balance: number; // Số dư hiện tại
}

const WalletSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['tiền hàng', 'đồng chia', 'cấp bậc', 'đại lý', 'tổng'], required: true },
  balance: { type: Number, default: 0 },
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);
