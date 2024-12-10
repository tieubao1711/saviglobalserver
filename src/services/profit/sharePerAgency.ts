import Agency from "../../models/Agency";
import User from "../../models/User";
import Transaction from "../../models/Transaction";

export const profitForAgency = async (profit: number): Promise<Record<string, number>> => {
  const profitDistribution = {
    3: 0.02, // Đại lý cấp 3: 2%
    2: 0.03, // Đại lý cấp 2: 3%
    1: 0.05, // Đại lý cấp 1: 5%
  };

  const agencyProfits: Record<string, number> = {};

  for (const [rank, percentage] of Object.entries(profitDistribution)) {
    const agencies = await Agency.find({ rank: parseInt(rank) });

    const totalProfitForRank = profit * percentage;

    if (agencies.length > 0) {
      const profitPerAgency = totalProfitForRank / agencies.length;

      for (const agency of agencies) {
        const userId = agency.userId;

        await User.updateOne(
          { _id: userId },
          { $inc: { "wallets.globalWallet": profitPerAgency } }
        );

        const transaction = new Transaction({
          userId,
          type: "thưởng",
          amount: profitPerAgency,
          description: `Chia thưởng đại lý cấp ${rank}`,
          createdAt: new Date(),
        });

        await transaction.save();

        agencyProfits[userId.toString()] = (agencyProfits[userId.toString()] || 0) + profitPerAgency;

        console.log(`User ${userId} (Agency Level ${rank}) received ${profitPerAgency}.`);
      }
    }
  }

  return agencyProfits;
};
