import express, { Request, Response } from 'express';
import User from '../models/User';
import { authenticate } from '../middlewares/authMiddleware';
import bcrypt from 'bcrypt';
import Transaction from '../models/Transaction';

const router = express.Router();

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy thông tin user từ token (được gắn trong middleware authenticate)
    const userId = (req as any).user.id;

    // Tìm user trong database
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
      return;
    }

    // Trả về thông tin user
    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        idCard: user.idCard,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        region: user.region,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        companyPhone: user.companyPhone,
        homePhone: user.homePhone,
        email: user.email,
        address: user.address,
        referralCode: user.referralCode,
        uplineId: user.uplineId,
        rank: user.rank,
        totalIncome: user.totalIncome,
        maxIncome: user.maxIncome,
        status: user.status,
        wallets: user.wallets,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Lỗi server, vui lòng thử lại sau.' });
  }
});

router.post('/change-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      res.status(400).json({ status: 'error', message: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.' });
      return;
    }

    // Lấy thông tin người dùng từ token
    const userId = (req as any).user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
      return;
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ status: 'error', message: 'Mật khẩu hiện tại không chính xác.' });
      return;
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Lỗi server, vui lòng thử lại sau.' });
  }
});

router.get('/reward-history', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
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

export default router;
