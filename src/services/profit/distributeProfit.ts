import { sharePerPoint } from './sharePerPoint';
import { sharePerLevel } from './sharePerLevel';
import { Order } from '../../models/Order';

export const distributeProfit = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Lấy tổng giá trị đơn hàng trong ngày
    const totalProfit = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }, // Sử dụng 'totalPrice' thay vì 'totalProfit'
    ]);

    const profit = totalProfit[0]?.total || 0;

    console.log(`Total profit for the day: ${profit}`);

    // Chia 10% lợi nhuận cho tất cả ID
    const profitForPoints = profit * 0.1;
    console.log(`Profit allocated for points: ${profitForPoints}`);
    await sharePerPoint(profitForPoints);

    // Chia 15% lợi nhuận cho 24 tầng
    const profitForLevels = profit * 0.15;
    console.log(`Profit allocated for levels: ${profitForLevels}`);
    await sharePerLevel(profitForLevels);

    console.log('Profit distribution completed successfully.');
  } catch (error) {
    console.error('Error during profit distribution:', error);
  }
};
