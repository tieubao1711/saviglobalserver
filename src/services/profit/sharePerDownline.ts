import { BinaryTree } from "../../models/BinaryTree";
import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import { fetch3Downline } from "../binarytree/get3Downline";

// Hàm chia thưởng từ tuyến dưới
export const distributeDownlineProfit = async (profit: number): Promise<Record<string, number>> => {
  try {
    const allPoints = await Point.countDocuments();
    if (allPoints === 0) {
      console.log("No points found in the system.");
      return {};
    }

    // Tính lợi nhuận trên mỗi điểm
    const profitPerPoint = profit / allPoints;
    const userProfits: Record<string, number> = {};

    // Tìm tất cả user và tổng số điểm của họ
    const userPoints = await Point.aggregate([
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: 1 },
        },
      },
    ]);

    // Tỷ lệ chia thưởng cho các tầng dưới
    const percentages = [0.5, 0.3, 0.2]; // Tầng 1: 50%, Tầng 2: 30%, Tầng 3: 20%

    for (const user of userPoints) {
      const point = await Point.findOne({ userId: user._id }).lean();
      if (!point) {
        console.log(`Point not found for user ${user._id}`);
        continue;
      }

      const treeNode = await BinaryTree.findOne({ pointId: point._id }).lean();
      if (!treeNode) {
        console.log(`Tree node not found for user ${user._id}`);
        continue;
      }

      // Lấy 3 tầng dưới của người dùng
      const downlines = await fetch3Downline(treeNode._id.toString());

      // Gộp lợi nhuận theo level
      const profitByLevel: Record<number, number> = {};

      downlines.forEach((downline) => {
        if (!downline || !downline.user || downline.level > percentages.length) {
          console.log(`Invalid downline data for user ${user._id}.`);
          return;
        }

        const downlineProfit = profitPerPoint * percentages[downline.level - 1];

        if (downlineProfit <= 0) {
          console.log(`No profit to distribute for downline ${downline?.user?.username || "unknown"}.`);
          return;
        }

        // Gộp lợi nhuận theo level
        profitByLevel[downline.level] = (profitByLevel[downline.level] || 0) + downlineProfit;
      });

      // Cập nhật ví và lưu lịch sử giao dịch cho từng level
      await Promise.all(
        Object.entries(profitByLevel).map(async ([level, totalProfit]) => {
          const levelIndex = parseInt(level, 10);
          const percentage = percentages[levelIndex - 1] * 100;

          // Cập nhật ví của user
          await User.updateOne(
            { _id: user._id },
            { $inc: { "wallets.globalWallet": totalProfit } }
          );

          // Lưu lịch sử giao dịch
          const transaction = new Transaction({
            userId: user._id,
            type: "thưởng",
            amount: totalProfit,
            description: `Nhận ${percentage}% từ lợi nhuận tuyến dưới F${level}`,
            createdAt: new Date(),
          });

          await transaction.save();

          // Cập nhật lợi nhuận hôm nay của user
          userProfits[user._id] = (userProfits[user._id] || 0) + totalProfit;
        })
      );
    }

    console.log("Downline profit distribution completed successfully.");
    return userProfits;
  } catch (error) {
    console.error("Error during downline profit distribution:", error);
    return {};
  }
};
