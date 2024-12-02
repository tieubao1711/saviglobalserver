import express, { Request, Response } from 'express';
import { BinaryTree } from '../models/BinaryTree';
import mongoose from 'mongoose';
import User from '../models/User';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Lấy toàn bộ cây nhị phân và populate
    const binaryTree = await BinaryTree.find({})
      .populate({
        path: 'pointId',
        model: 'Point',
        populate: {
          path: 'userId',
          model: 'User',
        },
      })
      .lean();

    // Chuẩn bị dữ liệu trả về
    const data = binaryTree.map(node => ({
      id: node._id,
      parentId: node.parentId,
      leftChildId: node.leftChildId,
      rightChildId: node.rightChildId,
      depth: node.depth,
      user: node.pointId && (node.pointId as any).userId
        ? {
            id: (node.pointId as any).userId._id,
            username: (node.pointId as any).userId.username,
            globalWallet: (node.pointId as any).userId.wallets.globalWallet,
            }
        : null,

    }));

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching binary tree:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/members', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Lấy userId từ middleware authenticate

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'User not authenticated' });
      return;
    }

    // Hàm đệ quy để lấy tất cả các thành viên cấp dưới
    const fetchMembersRecursively = async (parentId: string): Promise<any[]> => {
      const childNodes = await BinaryTree.find({ parentId })
        .populate({
          path: 'pointId',
          model: 'Point',
          populate: {
            path: 'userId',
            model: 'User',
          },
        })
        .lean();

      const members = [];
      for (const node of childNodes) {
        const member = {
          id: node._id,
          parentId: node.parentId,
          leftChildId: node.leftChildId,
          rightChildId: node.rightChildId,
          depth: node.depth,
          user: node.pointId && (node.pointId as any).userId
            ? {
                id: (node.pointId as any).userId._id,
                username: (node.pointId as any).userId.username,
                globalWallet: (node.pointId as any).userId.wallets.globalWallet,
              }
            : null,
        };

        members.push(member);

        // Đệ quy tìm thành viên cấp dưới
        const subMembers = await fetchMembersRecursively(member.id.toString());
        members.push(...subMembers);
      }

      return members;
    };

    // Lấy node gốc từ `BinaryTree` tương ứng với user
    const rootNode = await BinaryTree.findOne({ 'pointId.userId': new mongoose.Types.ObjectId(userId) })
      .populate({
        path: 'pointId',
        model: 'Point',
        populate: {
          path: 'userId',
          model: 'User',
        },
      })
      .lean();

    if (!rootNode) {
      res.status(404).json({ status: 'error', message: 'Root node not found' });
      return;
    }

    const members = [];

    // Thêm chính bản thân người dùng vào danh sách
    const self = {
      id: rootNode._id,
      parentId: rootNode.parentId,
      leftChildId: rootNode.leftChildId,
      rightChildId: rootNode.rightChildId,
      depth: rootNode.depth,
      user: rootNode.pointId && (rootNode.pointId as any).userId
        ? {
            id: (rootNode.pointId as any).userId._id,
            username: (rootNode.pointId as any).userId.username,
            globalWallet: (rootNode.pointId as any).userId.wallets.globalWallet,
          }
        : null,
    };

    members.push(self);

    // Lấy tất cả các cấp dưới
    const subMembers = await fetchMembersRecursively(rootNode._id.toString());
    members.push(...subMembers);

    res.status(200).json({ status: 'success', data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

export default router;
