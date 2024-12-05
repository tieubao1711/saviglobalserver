import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerLevel = async (profit: number) => {
  const profitPerLevel = profit / 24;

  for (let level = 0; level <= 23; level++) {
    const nodesAtLevel = await BinaryTree.find({ depth: level, pointId: { $ne: null } });

    if (nodesAtLevel.length > 0) {
      const profitPerId = profitPerLevel / nodesAtLevel.length;

      for (const node of nodesAtLevel) {
        const point = await Point.findById(node.pointId);
        if (point) {
          // Cập nhật ví tổng (globalWallet)
          await User.updateOne(
            { _id: point.userId },
            { $inc: { "wallets.globalWallet": profitPerId } } // Cập nhật vào ví tổng
          );

          // Lưu lịch sử trả thưởng
          const transaction = new Transaction({
            userId: point.userId,
            type: 'thưởng',
            amount: profitPerId,
            description: `Chia thưởng 15% lợi nhuận tổng cho tầng ${level}`,
            createdAt: new Date(),
          });

          await transaction.save();
        }
      }
    }
  }
};
