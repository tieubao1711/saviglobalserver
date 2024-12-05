import Admin from '../models/Admin'; // Model Admin
import bcrypt from 'bcrypt';
import { CompanyWallet } from '../models/CompanyWallet';

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

    // Kiểm tra xem ví công ty "SAVI" đã tồn tại chưa
    const existingWallet = await CompanyWallet.findOne({ companyName: 'SAVI' });

    if (!existingWallet) {
      // Nếu chưa có, tạo ví công ty "SAVI" với giá trị mặc định
      const newWallet = new CompanyWallet({
        companyName: 'SAVI',
        stockWallet: 0, // Số dư ví tiền hàng mặc định
        profitWallet: 0, // Số dư ví lợi nhuận mặc định
      });

      // Lưu ví công ty vào cơ sở dữ liệu
      await newWallet.save();

      console.log('Ví công ty "SAVI" đã được tạo thành công.');
    } else {
      console.log('Ví công ty "SAVI" đã tồn tại.');
    }
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error);
  }
};

export default initData;
