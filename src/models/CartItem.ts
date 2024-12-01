import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct } from './Product';

export interface ICartItem extends Document {
  productId: Types.ObjectId; // Sử dụng Types.ObjectId
  quantity: number;
  totalPrice: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId; // Sử dụng Types.ObjectId
  items: ICartItem[];
  totalTransactions: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartPopulatedItem {
  productId: IProduct; // Sau khi populate, productId sẽ là IProduct
  quantity: number;
  totalPrice: number;
}

// Định nghĩa ICartPopulated (giỏ hàng sau populate)
export interface ICartPopulated extends Document {
  userId: Types.ObjectId; // ID người dùng
  items: ICartPopulatedItem[]; // Danh sách mục trong giỏ (đã populate)
  totalTransactions: number; // Tổng giao dịch
  totalPrice: number; // Tổng giá trị đơn hàng
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Tham chiếu Product ID
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
    totalTransactions: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
export const CartItem = mongoose.model<ICartItem>('CartItem', CartItemSchema);
