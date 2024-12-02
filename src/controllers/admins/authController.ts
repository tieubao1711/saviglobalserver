import { Request, Response } from 'express';
import Admin from '../../models/Admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ddb20b53-f023-4033-b2b5-6f1bfeeb1528';

// Đăng nhập cho Admin
export const adminLogin = async (req: Request, res: Response): Promise<any> => { // Thay Promise<void> thành Promise<any>
  try {
    const { username, password } = req.body;

    // Kiểm tra admin tồn tại
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Tạo token JWT
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Trả về thông báo thành công và token
    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};