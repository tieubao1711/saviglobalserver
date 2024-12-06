import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerLevel = async (profit: number): Promise<Record<string, number>> => {
  const profitPerLevel = profit / 24; // Chia đều lợi nhuận cho 24 tầng
  const levelProfits: Record<string, number> = {}; // Lưu lợi nhuận cho từng user

  for (let level = 0; level < 24; level++) {
    // Lấy danh sách node tại tầng `level`
    const nodesAtLevel = await BinaryTree.find({ depth: level, pointId: { $ne: null } });

    if (nodesAtLevel.length > 0) {
      const profitPerNode = profitPerLevel / nodesAtLevel.length; // Lợi nhuận mỗi node

      for (const node of nodesAtLevel) {
        const point = await Point.findById(node.pointId); // Lấy `Point` dựa trên `pointId`
        if (point) {
          const userId = point.userId; // Lấy `userId` từ `Point`

          if (userId) {
            // Cập nhật ví tổng của user
            await User.updateOne(
              { _id: userId },
              { $inc: { "wallets.globalWallet": profitPerNode } }
            );

            // Ghi lại lịch sử giao dịch
            const transaction = new Transaction({
              userId,
              type: "thưởng",
              amount: profitPerNode,
              description: `Chia thưởng 15% lợi nhuận tổng cho tầng ${level}`,
              createdAt: new Date(),
            });

            await transaction.save();

            // Cập nhật lợi nhuận trong `levelProfits`
            levelProfits[userId.toString()] = (levelProfits[userId.toString()] || 0) + profitPerNode;

            console.log(`User ${userId} nhận ${profitPerNode} từ tầng ${level}.`);
          } else {
            console.log(`Node ${node._id} không có userId.`);
          }
        } else {
          console.log(`Không tìm thấy Point cho node ${node._id}.`);
        }
      }
    } else {
      console.log(`Không có node nào ở tầng ${level}.`);
    }
  }

  console.log("Hoàn tất chia thưởng cho các tầng.");
  return levelProfits; // Trả về lợi nhuận đã phân phối
};
