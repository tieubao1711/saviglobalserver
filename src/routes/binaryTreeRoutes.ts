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

router.get('/members', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Tìm thông tin người dùng
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
      return;
    }

    // Hàm đệ quy để tìm tất cả các thành viên cấp dưới
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

        // Thêm thành viên hiện tại
        members.push(member);

        // Đệ quy tìm cấp dưới
        const subMembers = await fetchMembersRecursively(member.id.toString());
        members.push(...subMembers);
      }

      return members;
    };

    // Bắt đầu từ chính bản thân người dùng
    const rootNode = await BinaryTree.findOne({ pointId: { $exists: true, $eq: userId } })
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
    if (rootNode) {
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

      // Thêm tất cả các cấp dưới
      const subMembers = await fetchMembersRecursively(rootNode._id.toString());
      members.push(...subMembers);
    }

    res.status(200).json({ status: 'success', data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

export default router;
