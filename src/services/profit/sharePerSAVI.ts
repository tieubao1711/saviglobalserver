import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerSAVI = async (profit: number): Promise<Record<string, number>> => {
  const rankDistribution = {
    "SAVI 1": { ids: 5, percent: 10 },
    "SAVI 2": { ids: 30, percent: 6 },
    "SAVI 3": { ids: 100, percent: 4 },
    "SAVI 4": { ids: 300, percent: 3 },
    "SAVI 5": { ids: 600, percent: 2 },
    "SAVI 6": { ids: 1000, percent: 1 },
  };

  // Tính tổng phần trăm cho từng rank (tích lũy từ rank thấp hơn)
  const ranks = Object.entries(rankDistribution);
  let cumulativePercent = 0;
  let cumulativeRankDistribution: Record<string, number> = {};

  for (const [rank, { percent }] of ranks) {
    cumulativePercent += percent;
    cumulativeRankDistribution[rank] = cumulativePercent;
  }

  const rankProfits: Record<string, number> = {};

  for (const [rank, cumulativePercent] of Object.entries(cumulativeRankDistribution)) {
    const rankProfit = (profit * cumulativePercent) / 100;

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
        description: `Chia thưởng ${cumulativePercent}% lợi nhuận từ rank ${rank}`,
        createdAt: new Date(),
      });

      await transaction.save();

      // Cập nhật lợi nhuận hôm nay
      rankProfits[user._id.toString()] = (rankProfits[user._id.toString()] || 0) + profitPerUser;

      console.log(`User ${user._id} (Rank ${rank}) received ${profitPerUser}.`);
    }
  }

  return rankProfits;
};
