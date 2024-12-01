import cron from 'node-cron';
import { distributeProfit } from './profit/distributeProfit';

export const setupCronJob = () => {
  cron.schedule('0 23 * * *', async () => {
    console.log('Running daily profit distribution...');
    try {
      await distributeProfit();
      console.log('Profit distribution completed.');
    } catch (error) {
      console.error('Error during profit distribution:', error);
    }
  });
};
