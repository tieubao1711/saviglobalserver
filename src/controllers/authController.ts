import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import UplineHistory from '../models/uplineHistory';

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, idCard, phoneNumber, referralCode } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: 'Tài khoản đã tồn tại' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let uplineId = undefined;
    if (referralCode) {
      const uplineUser = await User.findOne({ referralCode });
      if (!uplineUser) {
        res.status(400).json({ error: 'Mã giới thiệu không hợp lệ' });
        return;
      }
      uplineId = uplineUser._id;
    }

    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      idCard,
      phoneNumber,
      referralCode,
      uplineId,
      rank: 'Đồng',
    });

    await newUser.save();

    if (uplineId) {
      await UplineHistory.create({
        userId: newUser._id,
        uplineId,
      });
    }

    res.status(201).json({ message: 'Đăng ký thành công', user: { username, fullName, phoneNumber } });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
  }
};
