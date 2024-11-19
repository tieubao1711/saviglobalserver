import User from '../models/User';
import Transaction from '../models/Transaction';

export const calculateDailyRewards = async () => {
  const users = await User.find();
  for (const user of users) {
    // Tính thu nhập từ tuyến trên (Upline 1, 2, 3)
    let totalReward = 0;

    if (user.uplineId) {
      const uplineUser = await User.findById(user.uplineId);
      if (uplineUser) {
        const reward = uplineUser.totalIncome * 0.05; // 5% thu nhập từ Upline 1
        totalReward += reward;
      }
    }

    // Cập nhật ví tiêu dùng
    user.wallets.consumptionWallet += totalReward;
    await user.save();

    // Lưu giao dịch
    await Transaction.create({
      userId: user._id,
      type: 'thưởng',
      amount: totalReward,
      description: 'Thu nhập từ tuyến trên',
    });
  }
};
