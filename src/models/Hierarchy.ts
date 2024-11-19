import mongoose, { Schema, Document } from 'mongoose';

export interface IHierarchy extends Document {
  userId: string; // ID của thành viên
  uplineId: string; // ID của tuyến trên
  downlineIds: string[]; // Danh sách các tuyến dưới
}

const HierarchySchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uplineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downlineIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
});

export default mongoose.model<IHierarchy>('Hierarchy', HierarchySchema);
