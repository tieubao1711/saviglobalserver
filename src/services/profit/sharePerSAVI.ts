import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerSAVI = async (profit: number) => {
  const rankDistribution = {
    savi1: { ids: 5, percent: 10 },
    savi2: { ids: 30, percent: 6 },
    savi3: { ids: 100, percent: 4 },
    savi4: { ids: 300, percent: 3 },
    savi5: { ids: 600, percent: 2 },
    savi6: { ids: 1000, percent: 1 },
  };

  for (const [rank, { ids, percent }] of Object.entries(rankDistribution)) {
    const rankProfit = (profit * percent) / 100;

    // Lấy danh sách người dùng theo rank
    const users = await User.find({ rank }).select("_id").lean();

    if (users.length === 0) continue;

    const profitPerUser = rankProfit / users.length;

    for (const user of users) {
      // Cập nhật ví tổng (globalWallet)
      await User.updateOne(
        { _id: user._id },
        { $inc: { "wallets.globalWallet": profitPerUser } }
      );

      // Lưu lịch sử trả thưởng
      const transaction = new Transaction({
        userId: user._id,
        type: "thưởng",
        amount: profitPerUser,
        description: `Chia thưởng ${percent}% lợi nhuận từ rank ${rank} (${users.length} ID)`,
        createdAt: new Date(),
      });

      await transaction.save();
    }
  }
};
