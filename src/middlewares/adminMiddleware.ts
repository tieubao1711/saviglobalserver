import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Secret key để xác thực token
const JWT_SECRET = process.env.JWT_SECRET || 'ddb20b53-f023-4033-b2b5-6f1bfeeb1528';

// Middleware xác thực
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Kiểm tra xem token có được cung cấp không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token không được cung cấp' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Lấy token sau "Bearer"

  try {
    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };

    // Gắn thông tin người dùng vào req để sử dụng trong các API tiếp theo
    req.user = decoded;
    next(); // Tiếp tục xử lý API
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
