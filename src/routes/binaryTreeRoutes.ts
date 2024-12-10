import express, { Request, Response } from 'express';
import { BinaryTree } from '../models/BinaryTree';
import mongoose from 'mongoose';
import User from '../models/User';
import { authenticate } from '../middlewares/authMiddleware';
import { Point } from '../models/Point';
import { fetch3Downline } from '../services/binarytree/get3Downline';

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

const countDescendants = async (parentId: string): Promise<number> => {
  const childNodes = await BinaryTree.find({ parentId }).lean();
  
  let count = childNodes.length;

  for (const node of childNodes) {
    const subCount = await countDescendants(node._id.toString()); // Đệ quy
    count += subCount;
  }

  return count;
};


router.get('/3upline', authenticate, async (req: Request, res: Response) => {
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
  
    const currentNodeId = treeNode._id;
  
    if (!currentNodeId) {
      res.status(400).json({ status: 'error', message: 'Invalid or missing node ID' });
      return;
    }
  
    // Hàm lấy danh sách upline (từ parent lên đến root)
    const fetchUpline = async (nodeId: string): Promise<any[]> => {
      const upline = [];
  
      let currentNode = await BinaryTree.findById(nodeId)
        .populate({
          path: 'pointId',
          model: 'Point',
          populate: {
            path: 'userId',
            model: 'User',
          },
        })
        .lean();
  
      while (currentNode?.parentId) {
        const parentNode = await BinaryTree.findById(currentNode.parentId)
          .populate({
            path: 'pointId',
            model: 'Point',
            populate: {
              path: 'userId',
              model: 'User',
            },
          })
          .lean();
  
        if (parentNode) {
          upline.push({
            id: parentNode._id,
            parentId: parentNode.parentId,
            leftChildId: parentNode.leftChildId,
            rightChildId: parentNode.rightChildId,
            depth: parentNode.depth,
            user: parentNode.pointId && (parentNode.pointId as any).userId
              ? {
                  id: (parentNode.pointId as any).userId._id,
                  username: (parentNode.pointId as any).userId.username,
                  globalWallet: (parentNode.pointId as any).userId.wallets.globalWallet,
                }
              : null,
          });
        }
        currentNode = parentNode; // Tiếp tục duyệt lên cấp trên
      }
  
      return upline;
    };
  
    // Lấy danh sách upline
    const upline = await fetchUpline(currentNodeId.toString());
  
    // Trả về kết quả
    res.status(200).json({ status: 'success', data: upline });
  } catch (error) {
    console.error('Error fetching upline:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }   
});

// Router cập nhật cấp bậc người dùng
router.put('/update-rank', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // Lấy userId từ body request
    if (!userId) {
      res.status(400).json({ status: 'error', message: 'UserId is required' });
      return;
    }

    // Tìm userId trong BinaryTree
    const userBinaryTreeNode = await BinaryTree.findOne({ 'pointId.userId': userId }).lean();
    if (!userBinaryTreeNode) {
      res.status(404).json({ status: 'error', message: 'User not found in BinaryTree' });
      return;
    }

    const parentId = userBinaryTreeNode._id.toString(); // Lấy parentId của user

    // Đếm số lượng cấp dưới
    const numDescendants = await countDescendants(parentId);

    // Xác định rank mới dựa trên số lượng cấp dưới
    let newRank = 'SAVI 1';
    if (numDescendants >= 1000) {
      newRank = 'SAVI 6';
    } else if (numDescendants >= 600) {
      newRank = 'SAVI 5';
    } else if (numDescendants >= 300) {
      newRank = 'SAVI 4';
    } else if (numDescendants >= 100) {
      newRank = 'SAVI 3';
    } else if (numDescendants >= 30) {
      newRank = 'SAVI 2';
    }

    // Cập nhật rank cho người dùng
    const user = await User.findByIdAndUpdate(userId, { rank: newRank }, { new: true });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Trả về kết quả
    res.status(200).json({
      status: 'success',
      message: `Rank updated successfully to ${newRank}`,
      data: user,
    });

  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

router.get('/3downline', authenticate, async (req: Request, res: Response) => {
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
  
    const currentNodeId = treeNode._id;
  
    if (!currentNodeId) {
      res.status(400).json({ status: 'error', message: 'Invalid or missing node ID' });
      return;
    }
  
    // Lấy danh sách upline
    const upline = await fetch3Downline(currentNodeId.toString());
  
    // Trả về kết quả
    res.status(200).json({ status: 'success', data: upline });
  } catch (error) {
    console.error('Error fetching upline:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }   
});

export default router;
