import express, { Request, Response } from 'express';
import { generateFakeData, setupCronJob } from './../testDemo';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { Order } from '../models/Order';

const router = express.Router();

// Route: Tạo dữ liệu giả
router.post('/generate-fake-data', async (_req: Request, res: Response) => {
  try {
    await generateFakeData();
    res.status(200).json({ message: 'Fake data created successfully.' });
  } catch (error) {
    console.error('Error generating fake data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route: Kích hoạt cron job
router.post('/start-cron', (_req: Request, res: Response) => {
  try {
    setupCronJob();
    res.status(200).json({ message: 'Cron job started successfully.' });
  } catch (error) {
    console.error('Error starting cron job:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route: Lấy danh sách người dùng và giao dịch gần đây
router.get('/test-data', async (_req: Request, res: Response) => {
  try {
    // Lấy danh sách người dùng
    const users = await User.find({}).lean();

    // Lấy giao dịch gần đây, sắp xếp theo thời gian gần nhất
    const transactions = await Transaction.find({}).sort({ createdAt: -1 }).lean();

    // Duyệt qua danh sách người dùng để ghép giao dịch gần nhất
    const data = users.map(user => {
      const lastTransaction = transactions.find(
        transaction => transaction.userId.toString() === user._id.toString()
      );

      return {
        userId: user._id,
        username: user.username,
        balance: user.wallets?.globalWallet || 0,
        lastReward: lastTransaction?.amount || 0,
        time: lastTransaction?.createdAt || 'N/A',
      };
    });

    // Trả về kết quả
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching test data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/reward-history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ message: 'Missing or invalid userId' });
      return;
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Lấy danh sách giao dịch (lọc theo `type: 'thưởng'`)
    const transactions = await Transaction.find({ userId, type: 'thưởng' }).sort({ createdAt: -1 });

    // Trả về dữ liệu
    res.status(200).json({
      username: user.username,
      history: transactions.map(transaction => ({
        date: transaction.createdAt,
        amount: transaction.amount,
        description: transaction.description || 'No description',
        status: transaction.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching reward history:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/total-profit', async (_req: Request, res: Response) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Tính tổng lợi nhuận trong ngày
    const totalProfit = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }, // Sửa 'totalProfit' thành 'totalPrice'
    ]);

    const profit = totalProfit[0]?.total || 0;

    res.status(200).json({ profit });
  } catch (error) {
    console.error('Error fetching total profit:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


export default router;
