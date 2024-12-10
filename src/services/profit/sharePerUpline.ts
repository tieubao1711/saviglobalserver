import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import { fetch3Upline } from "../binarytree/get3Upline";
import { convertRanktoNumber } from "../rank/convertRanktoNumber";

// Hàm chia thưởng từ tuyến trên
export const distributeUplineProfit = async (userProfits: Record<string, number>) => {
  try {
    for (const [userId, profit] of Object.entries(userProfits)) {
      const point = await Point.findOne({ userId }).lean();
      if (!point) {
        console.log(`Point not found for user ${userId}`);
        continue;
      }

      const treeNode = await BinaryTree.findOne({ pointId: point._id }).lean();
      if (!treeNode) {
        console.log(`Tree node not found for user ${userId}`);
        continue;
      }

      const uplines = await fetch3Upline(treeNode._id.toString());

      const user = await User.findById(userId);
      if (!user) {
        console.log(`User ${userId} not found during upline profit distribution.`);
        continue;
      }

      const userRank = convertRanktoNumber(user.rank);

      for (let i = 0; i < uplines.length; i++) {
        const upline = uplines[i];
        if (userRank == 0) {
          console.log(`Skipping upline ${user.username} with invalid rank or user.`);
          continue;
        }

        if (i >= userRank) {
          console.log(`${user.username} chưa đủ điều kiện nhận thưởng upline tuyến ${i + 1}`);
          continue;
        }

        // Tỷ lệ chia thưởng cho các tuyến trên
        const percentages = [0.05, 0.03, 0.02]; // Tuyến 1: 5%, Tuyến 2: 3%, Tuyến 3: 2%
        const uplineProfit = userProfits[upline.user.id] * percentages[i];

        if (uplineProfit <= 0) {
          console.log(`No profit to distribute for upline ${upline.user.username}.`);
          continue;
        }

        // Cập nhật ví của upline
        await User.updateOne(
          { _id: upline.user.id },
          { $inc: { "wallets.globalWallet": uplineProfit } }
        );

        // Lưu lịch sử giao dịch
        const transaction = new Transaction({
          userId: user.id,
          type: "thưởng",
          amount: uplineProfit,
          description: `Nhận ${percentages[i] * 100}% từ lợi nhuận của tuyến ${i + 1} của ${upline.user.username}, 
          tổng lợi nhuận của ${upline.user.username} là ${userProfits[upline.user.id]}`,
          createdAt: new Date(),
        });

        await transaction.save();
      }
    }

    console.log("Upline profit distribution completed successfully.");
  } catch (error) {
    console.error("Error during upline profit distribution:", error);
  }
};
