import cron from 'node-cron';
import { calculateDailyRewards } from './rewardAlgorithm';

cron.schedule('0 23 * * *', async () => {
  console.log('Bắt đầu tính toán thưởng hàng ngày...');
  await calculateDailyRewards();
  console.log('Hoàn tất tính toán thưởng hàng ngày!');
});
