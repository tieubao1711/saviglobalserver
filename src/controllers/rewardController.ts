import User from '../models/User';
import Transaction from '../models/Transaction';

export const calculateDailyRewards = async () => {
  const users = await User.find();

  for (const user of users) {
    if (user.totalIncome >= user.maxIncome) {
      user.status = 'suspended';
      await user.save();
      continue;
    }

    let totalReward = 0;

    if (user.uplineId) {
      const uplineUser = await User.findById(user.uplineId);
      if (uplineUser) {
        const reward = uplineUser.totalIncome * 0.05; // 5% từ tuyến trên
        totalReward += reward;
      }
    }

    user.wallets.consumptionWallet += totalReward;
    user.totalIncome += totalReward;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'thưởng',
      amount: totalReward,
      description: 'Thu nhập từ tuyến trên',
    });
  }
};
