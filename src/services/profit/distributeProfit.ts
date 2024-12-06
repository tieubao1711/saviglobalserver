import { sharePerPoint } from './sharePerPoint';
import { sharePerLevel } from './sharePerLevel';
import { sharePerSAVI } from './sharePerSAVI';
import { profitForAgency } from './sharePerAgency';
import { distributeUplineProfit } from './sharePerUpline'; // Import hàm chia tuyến trên
import { CompanyWallet } from '../../models/CompanyWallet';
import User from '../../models/User';

export const distributeProfit = async () => {
  try {
    const companyWallet = await CompanyWallet.findOne({ companyName: 'SAVI' });
    if (!companyWallet) {
      console.log('Company wallet not found.');
      return;
    }

    const profit = companyWallet.sharedWallet;

    console.log(`Total profit for the day: ${profit}`);

    // Chia lợi nhuận
    const profitForPoints = profit * 0.1;
    const profitForLevels = profit * 0.15;
    const profitForSAVIs = profit * 0.26;
    const profitForAgencies = profit * 0.1;

    // Gọi các hàm phân phối và thu thập lợi nhuận từng user
    const pointProfits = await sharePerPoint(profitForPoints);
    const levelProfits = await sharePerLevel(profitForLevels);
    const saviProfits = await sharePerSAVI(profitForSAVIs);
    const agencyProfits = await profitForAgency(profitForAgencies);

    // Hợp nhất lợi nhuận từ các nguồn
    const totalProfits: Record<string, number> = {};

    const mergeProfits = (source: Record<string, number>) => {
      for (const [userId, profit] of Object.entries(source)) {
        totalProfits[userId] = (totalProfits[userId] || 0) + profit;
      }
    };

    mergeProfits(pointProfits);
    mergeProfits(levelProfits);
    mergeProfits(saviProfits);
    mergeProfits(agencyProfits);

    // Cập nhật tổng lợi nhuận vào ví của user và lưu log
    for (const [userId, profit] of Object.entries(totalProfits)) {
      await User.updateOne(
        { _id: userId },
        { $inc: { "wallets.globalWallet": profit } }
      );
      console.log(`User ${userId} received a total profit of ${profit}`);
    }

    // Phân phối lợi nhuận từ tuyến trên
    await distributeUplineProfit(totalProfits);

    console.log('Profit distribution completed successfully.');
  } catch (error) {
    console.error('Error during profit distribution:', error);
  }
};
