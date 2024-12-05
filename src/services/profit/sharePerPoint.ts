import { Point } from '../../models/Point';
import Transaction from '../../models/Transaction';
import User from '../../models/User';

export const sharePerPoint = async (profit: number) => {
  const allPoints = await Point.countDocuments();
  if (allPoints === 0) return;

  const profitPerPoint = profit / allPoints;

  const userPoints = await Point.aggregate([
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: 1 },
      },
    },
  ]);

  for (const user of userPoints) {
    const userShare = profitPerPoint * user.totalPoints;

    // Cập nhật ví tổng (globalWallet)
    await User.updateOne(
      { _id: user._id },
      { $inc: { "wallets.globalWallet": userShare } } // Cập nhật vào ví tổng
    );

    // Lưu lịch sử trả thưởng
    const transaction = new Transaction({
      userId: user._id,
      type: 'thưởng',
      amount: userShare,
      description: `Chia thưởng 10% lợi nhuận tổng từ ${allPoints} ID`,
      createdAt: new Date(),
    });

    await transaction.save();
  }
};
