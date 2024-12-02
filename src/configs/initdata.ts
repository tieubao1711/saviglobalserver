import Admin from '../models/Admin'; // Đảm bảo bạn có model Admin
import bcrypt from 'bcrypt';

const initData = async function () {
  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (!existingAdmin) {
      // Nếu không có admin, tạo mới tài khoản admin với mật khẩu mặc định '123321a'
      const hashedPassword = await bcrypt.hash('123321a', 10); // Hash mật khẩu

      const newAdmin = new Admin({
        username: 'admin',
        password: hashedPassword,
        // Thêm các trường khác nếu cần
      });

      // Lưu admin vào cơ sở dữ liệu
      await newAdmin.save();

      console.log('Admin đã được tạo thành công.');
    } else {
      console.log('Admin đã tồn tại.');
    }
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error);
  }
};

export default initData;
