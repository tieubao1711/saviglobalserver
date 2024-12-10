import { sharePerPoint } from './sharePerPoint';
import { sharePerLevel2 } from './sharePerLevel2';
import { sharePerSAVI } from './sharePerSAVI';
import { profitForAgency } from './sharePerAgency';
import { distributeUplineProfit } from './sharePerUpline'; // Import hàm chia tuyến trên
import { CompanyWallet } from '../../models/CompanyWallet';
import User from '../../models/User';
import { log } from 'console';
import { distributeDownlineProfit } from './sharePerDownline';

export const distributeProfit = async () => {
  try {
    const companyWallet = await CompanyWallet.findOne({ companyName: 'SAVI' });
    if (!companyWallet) {
      console.log('Company wallet not found.');
      return;
    }

    const profit = companyWallet.profitWallet;

    console.log(`Total profit for the day: ${profit}`);

    // Chia lợi nhuận
    const profitForPoints = profit * 0.1;
    const profitForLevels = profit * 0.15;
    const profitForDownline = profit * 0.1;

    // Gọi các hàm phân phối và thu thập lợi nhuận từng user
    const pointProfits = await sharePerPoint(profitForPoints);
    const levelProfits = await sharePerLevel2(profitForLevels);
    const saviProfits = await sharePerSAVI(profit);
    const agencyProfits = await profitForAgency(profit);
    const downlineProfits = await distributeDownlineProfit(profitForDownline);

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
    mergeProfits(downlineProfits);

    // Cập nhật tổng lợi nhuận vào ví của user và lưu log
    for (const [userId, profit] of Object.entries(totalProfits)) {
      await User.updateOne(
        { _id: userId },
        { $inc: { "wallets.globalWallet": profit } }
      );
    }

    // Phân phối lợi nhuận từ tuyến trên
    await distributeUplineProfit(totalProfits);

    console.log('Profit distribution completed successfully.');
  } catch (error) {
    console.error('Error during profit distribution:', error);
  }
};
