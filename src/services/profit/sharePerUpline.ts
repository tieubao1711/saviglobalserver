import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import { fetch3Upline } from "../binarytree/get3Upline";
import { convertRanktoNumber } from "../rank/convertRanktoNumber";

export const distributeUplineProfit = async (userProfits: Record<string, number>) => {
  try {
    const trees = await BinaryTree.find().populate('pointId');

    for (const tree of trees) {
      const pointId = tree.pointId;
      const point = await Point.findById(pointId);
      const user = await User.findById(point?.userId);

      if (!user) {
        console.log(`User not found for point ID ${pointId}`);
        continue;
      }

      const userId = user._id? user._id.toString() : '';

      if (!userProfits[userId]) {
        console.log(`No profit to distribute for user ${user.username}`);
        continue;
      }
      
      let _pointId = point ? (point._id as string).toString() : '';
      const treeNode = await BinaryTree.findOne({ pointId: _pointId }).lean();
      if (!treeNode) {
        console.log(`Tree node not found for user ${userId}`);
        continue;
      }

      const uplines = await fetch3Upline(treeNode._id.toString());

      const userRank = convertRanktoNumber(user.rank);

      for (let i = 0; i < uplines.length; i++) {
        const upline = uplines[i];
        if (!upline || !upline.user) {
          console.log(`Invalid upline data for user ${user.username}`);
          continue;
        }

        if (userRank === 0) {
          console.log(`Skipping upline ${user.username} with invalid rank.`);
          continue;
        }

        if (i >= userRank) {
          console.log(`${user.username} chưa đủ điều kiện nhận thưởng upline tuyến ${i + 1}`);
          continue;
        }

        // Tỷ lệ chia thưởng cho các tuyến trên
        const percentages = [0.05, 0.03, 0.02]; // Tuyến 1: 5%, Tuyến 2: 3%, Tuyến 3: 2%
        const uplineProfit = userProfits[userId] * percentages[i];

        if (uplineProfit <= 0) {
          console.log(`No profit to distribute for upline ${upline.user.username}.`);
          continue;
        }

        // Cập nhật ví của upline
        await User.updateOne(
          { _id: upline.user._id },
          { $inc: { "wallets.globalWallet": uplineProfit } }
        );

        // Lưu lịch sử giao dịch
        const transaction = new Transaction({
          userId: upline.user._id,
          type: "thưởng",
          amount: uplineProfit,
          description: `Nhận ${percentages[i] * 100}% từ lợi nhuận của tuyến ${i + 1} của ${user.username}, tổng lợi nhuận của ${user.username} là ${userProfits[userId]}`,
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
