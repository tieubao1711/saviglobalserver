import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  userId: Types.ObjectId; // ID của người dùng
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalPrice: number; // Tổng giá trị đơn hàng
  status: string;     // Trạng thái đơn hàng (Pending, Completed, etc.)
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Completed' },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
