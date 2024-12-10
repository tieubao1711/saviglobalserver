import { BinaryTree } from "../../models/BinaryTree";

export const fetch3Downline = async (nodeId: string): Promise<any[]> => {
  const downline = [];
  const queue: { nodeId: any; level: number }[] = [{ nodeId, level: 0 }];

  while (queue.length > 0) {
    const { nodeId: currentId, level } = queue.shift()!;

    // Dừng lại nếu đã duyệt qua 3 tầng dưới
    if (level >= 3) {
      break;
    }

    // Tìm các node con trực tiếp
    const children = await BinaryTree.find({ parentId: currentId })
      .populate({
        path: "pointId",
        model: "Point",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .lean();

    for (const child of children) {
      if (child && child.pointId) {
        const user = (child.pointId as any).userId;
        if (user) {
          downline.push({
            id: child._id,
            user: {
              id: user._id,
              username: user.username,
              rank: user.rank,
              globalWallet: user.wallets.globalWallet,
            },
            level: level + 1,
          });
        }
      }

      // Thêm node con vào hàng đợi để duyệt tiếp
      queue.push({ nodeId: child._id, level: level + 1 });
    }
  }

  return downline;
};
