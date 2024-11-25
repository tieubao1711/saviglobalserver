import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string; // Tên sản phẩm
  code: string; // Mã sản phẩm
  price: number; // Giá sản phẩm (đơn vị: VND)
  description?: string; // Mô tả sản phẩm
  imageUrl: string; // URL hình ảnh
  pv: number; // PV (điểm thưởng)
  currency: string; // Đơn vị tiền tệ (ví dụ: VND, USD)
  createdAt: Date; // Ngày tạo
  updatedAt: Date; // Ngày cập nhật
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true }, // Tên sản phẩm bắt buộc
    code: { type: String, required: true, unique: true }, // Mã sản phẩm là duy nhất
    price: { type: Number, required: true }, // Giá sản phẩm
    description: { type: String }, // Mô tả sản phẩm (tùy chọn)
    imageUrl: { type: String, required: true }, // URL hình ảnh bắt buộc
    pv: { type: Number, required: true }, // PV bắt buộc
    currency: { type: String, default: 'VND' }, // Đơn vị tiền tệ, mặc định là VND
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

export default mongoose.model<IProduct>('Product', ProductSchema);
