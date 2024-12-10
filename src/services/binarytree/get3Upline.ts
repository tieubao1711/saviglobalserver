import { BinaryTree } from "../../models/BinaryTree";

export const fetch3Upline = async (nodeId: string): Promise<any[]> => {
    const upline = [];
    let currentNode = await BinaryTree.findById(nodeId)
      .populate({
        path: "pointId",
        model: "Point",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .lean();
  
    while (currentNode?.parentId && upline.length < 3) {
      const parentNode = await BinaryTree.findById(currentNode.parentId)
        .populate({
          path: "pointId",
          model: "Point",
          populate: {
            path: "userId",
            model: "User",
          },
        })
        .lean();
  
      if (parentNode && parentNode.pointId) {
        const user = (parentNode.pointId as any).userId;
        if (user) {
          upline.push({
            id: parentNode._id,
            user: {
              id: user._id,
              username: user.username,
              rank: user.rank,
              globalWallet: user.wallets.globalWallet,
            },
          });
        }
      }
  
      currentNode = parentNode; // Tiếp tục duyệt lên cấp trên
    }
  
    return upline;
};