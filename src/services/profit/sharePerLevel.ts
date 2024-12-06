import { BinaryTree } from "../../models/BinaryTree";
import Transaction from "../../models/Transaction";
import User from "../../models/User";

export const sharePerLevel = async (profit: number): Promise<Record<string, number>> => {
  const levelDistribution = 24;
  const profitPerLevel = profit / levelDistribution;

  const levelProfits: Record<string, number> = {};

  const users = await BinaryTree.aggregate([
    { $group: { _id: "$userId", depth: { $max: "$depth" } } },
  ]);

  for (const user of users) {
    const userProfit = profitPerLevel;

    await User.updateOne(
      { _id: user._id },
      { $inc: { "wallets.globalWallet": userProfit } }
    );

    const transaction = new Transaction({
      userId: user._id,
      type: "thưởng",
      amount: userProfit,
      description: `Chia thưởng từ ${levelDistribution} cấp`,
      createdAt: new Date(),
    });

    await transaction.save();

    levelProfits[user._id] = (levelProfits[user._id] || 0) + userProfit;

    console.log(`User ${user._id} received ${userProfit} from Levels.`);
  }

  return levelProfits;
};
