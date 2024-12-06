import { Point } from "../../models/Point";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerPoint = async (profit: number): Promise<Record<string, number>> => {
  const allPoints = await Point.countDocuments();
  if (allPoints === 0) return {};

  const profitPerPoint = profit / allPoints;
  const userProfits: Record<string, number> = {};

  const userPoints = await Point.aggregate([
    {
      $group: {
        _id: "$userId",
        totalPoints: { $sum: 1 },
      },
    },
  ]);

  for (const user of userPoints) {
    const userShare = profitPerPoint * user.totalPoints;

    // Cập nhật ví tổng (globalWallet)
    await User.updateOne(
      { _id: user._id },
      { $inc: { "wallets.globalWallet": userShare } }
    );

    // Ghi lại lịch sử trả thưởng
    const transaction = new Transaction({
      userId: user._id,
      type: "thưởng",
      amount: userShare,
      description: `Chia thưởng 10% lợi nhuận từ ${allPoints} điểm`,
      createdAt: new Date(),
    });

    await transaction.save();

    // Cập nhật lợi nhuận hôm nay của user
    userProfits[user._id] = (userProfits[user._id] || 0) + userShare;

    console.log(`User ${user._id} received ${userShare} from Points.`);
  }

  return userProfits;
};
