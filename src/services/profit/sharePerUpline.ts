import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import { convertRanktoNumber } from "../rank/convertRanktoNumber";

// Hàm lấy 3 tuyến trên
const fetchUpline = async (nodeId: string): Promise<any[]> => {
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

      const uplines = await fetchUpline(treeNode._id.toString());

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
        const uplineProfit = profit * percentages[i];

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
          description: `Nhận ${percentages[i] * 100}% từ lợi nhuận của tuyến ${i + 1} của ${upline.user.username}`,
          createdAt: new Date(),
        });

        await transaction.save();

        // console.log(
        //   `Upline ${upline.user.id} (Tuyến ${i + 1}) nhận ${uplineProfit.toFixed(
        //     2
        //   )} từ ${user.username}`
        // );
      }
    }

    console.log("Upline profit distribution completed successfully.");
  } catch (error) {
    console.error("Error during upline profit distribution:", error);
  }
};
