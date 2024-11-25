import mongoose, { Schema, Document } from 'mongoose';

// Import Product Interface
import { IProduct } from './Product';

export interface ICartItem extends Document {
  product: IProduct; // Tham chiếu đến sản phẩm (Product)
  quantity: number; // Số lượng sản phẩm trong giỏ
  totalPrice: number; // Tổng giá trị (price * quantity)
  totalPv: number; // Tổng PV (pv * quantity)
}

export interface ICart extends Document {
  userId: mongoose.Schema.Types.ObjectId; // ID người dùng sở hữu giỏ hàng
  items: ICartItem[]; // Danh sách sản phẩm trong giỏ hàng
  totalTransactions: number; // Tổng số giao dịch (số sản phẩm khác nhau trong giỏ)
  totalPrice: number; // Tổng giá trị đơn hàng
  totalPv: number; // Tổng PV
  createdAt: Date; // Ngày tạo giỏ hàng
  updatedAt: Date; // Ngày cập nhật giỏ hàng
}

const CartItemSchema: Schema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Tham chiếu Product
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // Sẽ được tính khi thêm sản phẩm vào giỏ
  totalPv: { type: Number, required: true }, // Sẽ được tính khi thêm sản phẩm vào giỏ
});

const CartSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema], // Danh sách sản phẩm
    totalTransactions: { type: Number, default: 0 }, // Tổng giao dịch
    totalPrice: { type: Number, default: 0 }, // Tổng số tiền
    totalPv: { type: Number, default: 0 }, // Tổng PV
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
export const CartItem = mongoose.model<ICartItem>('CartItem', CartItemSchema);
