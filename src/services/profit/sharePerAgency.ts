import Agency from "../../models/Agency";
import User from "../../models/User";
import Transaction from "../../models/Transaction";

export const profitForAgency = async (profit: number) => {
    try {
        // Lấy danh sách các đại lý, nhóm theo cấp bậc
        const agencies = await Agency.find();

        // Tính phần trăm lợi nhuận cho từng cấp
        const profitDistribution = {
            3: 0.05, // Đại lý cấp 3: 5%
            2: 0.03, // Đại lý cấp 2: 3%
            1: 0.02  // Đại lý cấp 1: 2%
        };

        // Phân phối lợi nhuận
        for (const [rank, percentage] of Object.entries(profitDistribution)) {
            const agenciesByRank = agencies.filter(a => a.rank === parseInt(rank));
            const totalProfitForRank = profit * percentage; // Lợi nhuận dành cho cấp này

            if (agenciesByRank.length > 0) {
                const profitPerAgency = totalProfitForRank / agenciesByRank.length; // Lợi nhuận chia đều

                for (const agency of agenciesByRank) {
                    const userId = agency.userId;

                    // Cập nhật ví tiền của người dùng
                    await User.updateOne(
                        { _id: userId },
                        { $inc: { "wallets.globalWallet": profitPerAgency } }
                    );

                    // Ghi lại lịch sử giao dịch
                    const transaction = new Transaction({
                        userId,
                        type: "thưởng",
                        amount: profitPerAgency,
                        description: `Chia thưởng lợi nhuận Đại Lý cấp ${rank}`,
                        createdAt: new Date(),
                    });
                    await transaction.save();

                    console.log(
                        `User ${userId} (Agency Level ${rank}) received ${profitPerAgency} profit.`
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error distributing profit to agencies:", error);
    }
};
