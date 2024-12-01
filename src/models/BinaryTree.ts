import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBinaryTree extends Document {
    pointId: Types.ObjectId | null;  // ID điểm đang chiếm giữ vị trí này (null nếu trống)
    parentId: Types.ObjectId | null; // ID node cha (null nếu là root)
    leftChildId: Types.ObjectId | null;  // ID node con trái
    rightChildId: Types.ObjectId | null; // ID node con phải
    depth: number; // Tầng của node (1 <= depth <= 24)
  }
  
  const BinaryTreeSchema: Schema = new Schema(
    {
      pointId: { type: Schema.Types.ObjectId, ref: 'Point', default: null },
      parentId: { type: Schema.Types.ObjectId, ref: 'BinaryTree', default: null },
      leftChildId: { type: Schema.Types.ObjectId, ref: 'BinaryTree', default: null },
      rightChildId: { type: Schema.Types.ObjectId, ref: 'BinaryTree', default: null },
      depth: { type: Number, required: true },
    }
  );
  
  export const BinaryTree = mongoose.model<IBinaryTree>('BinaryTree', BinaryTreeSchema);
  