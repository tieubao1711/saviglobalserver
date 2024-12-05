import { sharePerPoint } from './sharePerPoint';
import { sharePerLevel } from './sharePerLevel';
import { Order } from '../../models/Order';
import { CompanyWallet } from '../../models/CompanyWallet';
import { sharePerSAVI } from './sharePerSAVI';
import { profitForAgency } from './sharePerAgency';

export const distributeProfit = async () => {
  try {
    const companyWallet = await CompanyWallet.findOne({companyName: 'SAVI'});
    if (!companyWallet) return;

    const profit = companyWallet.sharedWallet;

    console.log(`Total profit for the day: ${profit}`);

    // Chia 10% lợi nhuận cho tất cả ID
    const profitForPoints = profit * 0.1;
    console.log(`Profit allocated for points: ${profitForPoints}`);
    await sharePerPoint(profitForPoints);

    // Chia 15% lợi nhuận cho 24 tầng
    const profitForLevels = profit * 0.15;
    console.log(`Profit allocated for levels: ${profitForLevels}`);
    await sharePerLevel(profitForLevels);

    // Chia 26% lợi nhuận cho 6 cấp lãnh đạo SAVI
    const profitForSAVIs = profit * 0.26;
    await sharePerSAVI(profit);

    //  Chia 10% lợi nhuận cho đại lý
    const profitForAgencies = profit * 0.1;
    await profitForAgency(profit);

    // Chia 10% lợi nhuận của tuyến trên

    console.log('Profit distribution completed successfully.');
  } catch (error) {
    console.error('Error during profit distribution:', error);
  }
};
