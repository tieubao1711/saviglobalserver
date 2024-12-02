import express, { Request, Response } from 'express';
import { BinaryTree } from '../models/BinaryTree';
import mongoose from 'mongoose';
import User from '../models/User';
import { authenticate } from '../middlewares/authMiddleware';
import { Point } from '../models/Point';

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
    const userId = req.user?.id; // Lấy userId từ middleware authenticate

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'User not authenticated' });
      return;
    }

    // Tìm `Point` chứa `userId`
    const point = await Point.findOne({ userId }).lean();

    if (!point) {
      res.status(404).json({ status: 'error', message: 'Point not found for the given userId' });
      return;
    }

    // Tìm `BinaryTree` chứa `pointId`
    const treeNode = await BinaryTree.findOne({ pointId: point._id }).lean();

    if (!treeNode) {
      res.status(404).json({ status: 'error', message: 'BinaryTree node not found for the given userId' });
      return;
    }

    console.log(treeNode)

    const parentId = treeNode._id;

    if (!parentId) {
      res.status(400).json({ status: 'error', message: 'Invalid or missing parentId' });
      return;
    }

    // Hàm đệ quy lấy toàn bộ các cấp dưới
    const fetchAllDescendants = async (parentId: string): Promise<any[]> => {
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

      const descendants = [];
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

        descendants.push(member);

        // Đệ quy lấy cấp dưới của node hiện tại
        const subDescendants = await fetchAllDescendants(member.id.toString());
        descendants.push(...subDescendants);
      }

      return descendants;
    };

    // Lấy node chính bản thân
    const selfNode = await BinaryTree.findById(parentId)
      .populate({
        path: 'pointId',
        model: 'Point',
        populate: {
          path: 'userId',
          model: 'User',
        },
      })
      .lean();

    if (!selfNode) {
      res.status(404).json({ status: 'error', message: 'Parent node not found' });
      return;
    }

    // Chuẩn bị dữ liệu cho chính bản thân
    const self = {
      id: selfNode._id,
      parentId: selfNode.parentId,
      leftChildId: selfNode.leftChildId,
      rightChildId: selfNode.rightChildId,
      depth: selfNode.depth,
      user: selfNode.pointId && (selfNode.pointId as any).userId
        ? {
            id: (selfNode.pointId as any).userId._id,
            username: (selfNode.pointId as any).userId.username,
            globalWallet: (selfNode.pointId as any).userId.wallets.globalWallet,
          }
        : null,
    };

    // Lấy tất cả cấp dưới
    const allDescendants = await fetchAllDescendants(parentId as string);

    // Gộp chính bản thân với các cấp dưới
    res.status(200).json({ status: 'success', data: [self, ...allDescendants] });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

export default router;
