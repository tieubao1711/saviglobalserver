import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import Wallet from '../models/Wallet';

const JWT_SECRET = process.env.JWT_SECRET || 'ddb20b53-f023-4033-b2b5-6f1bfeeb1528';
const router = express.Router();

// Interface cho dữ liệu đầu vào
interface RegisterRequest {
  username: string;
  password: string;
  idCard: string;
  fullName: string;
  phoneNumber: string;
  referralCode?: string; // Không bắt buộc
}

// API Đăng ký thành viên
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, idCard, phoneNumber, referralCode } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !fullName || !idCard || !phoneNumber) {
      res.status(201).json({ error: 'Vui lòng cung cấp đầy đủ thông tin đăng ký' });
      return;
    }

    // Kiểm tra tài khoản đã tồn tại
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(201).json({ error: 'Tài khoản đã tồn tại' });
      return;
    }

    // Kiểm tra mã giới thiệu (nếu có)
    // if (referralCode) {
    //   const referrer = await User.findOne({ username: referralCode });
    //   if (!referrer) {
    //     res.status(400).json({ error: 'Mã giới thiệu không hợp lệ' });
    //     return;
    //   }
    // }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser: IUser = new User({
      username,
      password: hashedPassword,
      fullName,
      idCard,
      phoneNumber,
      referralCode,
      rank: 'Đồng', // Mặc định cấp bậc là Đồng
      totalIncome: 0,
      maxIncome: 10000000, // Mặc định giới hạn thu nhập
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newUser.save();

    // Tạo các loại ví cho người dùng
    const walletTypes = ['tiền hàng', 'đồng chia', 'cấp bậc', 'đại lý', 'tổng'];
    const wallets = walletTypes.map((type) => ({
      userId: newUser._id,
      type,
      balance: 0,
    }));

    await Wallet.insertMany(wallets);

    // Trả về thông báo thành công
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        username,
        fullName,
        phoneNumber,
        rank: newUser.rank,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
  }
});

// API Đăng nhập
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Kiểm tra tài khoản có tồn tại không
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ error: 'Tài khoản không tồn tại' });
      return;
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Sai mật khẩu' });
      return;
    }

    // Tạo token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Thời gian hết hạn
    );

    res.status(200).json({ message: 'Đăng nhập thành công', token });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
  }
});

export default router;
