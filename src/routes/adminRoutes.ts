import express, { Request, Response } from 'express';
import { adminLogin } from '../controllers/admins/authController'; // Đảm bảo đường dẫn đúng
import { authenticateAdmin } from '../middlewares/adminMiddleware';

const router = express.Router(); // Đảm bảo sử dụng express.Router() để khai báo router

router.post('/login', adminLogin); // Gọi adminLogin khi POST đến route /login

// Nếu có thêm các route khác, bạn có thể tiếp tục như sau:
// router.get('/dashboard', authenticateAdmin, getAdminDashboard);

export default router;
