import express, { Request, Response } from 'express';
import User from '../models/User';
import { authenticate } from '../middlewares/authMiddleware';

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

export default router;
