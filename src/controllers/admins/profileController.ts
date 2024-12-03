// routes/adminRoutes.ts
import express, { Request, Response } from 'express';
import Admin from '../../models/Admin';

// Lấy thông tin admin
export const profile = async (req: Request, res: Response): Promise<any> => {
  try {
    const admin = await Admin.findById(req.user?.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({
      username: admin.username,
      // Bạn có thể trả về thêm thông tin khác của admin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
