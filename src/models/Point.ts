import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPoint extends Document {
  userId: Types.ObjectId; // ID của người dùng
  orderId: Types.ObjectId; // ID đơn hàng
  treePosition: Types.ObjectId | null; // Vị trí trong cây (nếu có)
  createdAt: Date;
}

const PointSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    treePosition: { type: Schema.Types.ObjectId, ref: 'BinaryTree', default: null },
  },
  { timestamps: true }
);

export const Point = mongoose.model<IPoint>('Point', PointSchema);
