import express, { Request, Response } from 'express';
import Product from '../models/Product';

const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy danh sách tất cả sản phẩm từ MongoDB
    const products = await Product.find();

    // Trả về danh sách sản phẩm
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server, vui lòng thử lại sau.',
    });
  }
});

export default router;
