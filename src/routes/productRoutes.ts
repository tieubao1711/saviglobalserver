import express, { Request, Response } from 'express';
import Product from '../models/Product';

const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
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

// Thêm sản phẩm
router.post('/add', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, price, description, imageUrl, currency } = req.body;

    // Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      code,
      price,
      description,
      imageUrl,
      currency,
    });

    await newProduct.save();

    res.status(201).json({
      status: 'success',
      data: newProduct,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server, không thể thêm sản phẩm.',
    });
  }
});

// Sửa sản phẩm
router.put('/update/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) {
      res.status(404).json({
        status: 'error',
        message: 'Sản phẩm không tồn tại.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server, không thể cập nhật sản phẩm.',
    });
  }
});

// Xóa sản phẩm
router.delete('/delete/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Xóa sản phẩm
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      res.status(404).json({
        status: 'error',
        message: 'Sản phẩm không tồn tại.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Sản phẩm đã được xóa.',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server, không thể xóa sản phẩm.',
    });
  }
});

export default router;
