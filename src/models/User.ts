import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string; // Tên đăng nhập
  password: string; // Mật khẩu hash
  fullName: string; // Họ và tên
  idCard: string; // Căn cước công dân
  dateOfBirth?: Date; // Ngày tháng năm sinh
  nationality?: string; // Quốc gia
  region?: string; // Khu vực
  gender?: string; // Giới tính
  phoneNumber: string; // Số điện thoại
  companyPhone?: string; // Số điện thoại công ty
  homePhone?: string; // Số điện thoại nhà riêng
  email?: string; // Email
  address?: string; // Địa chỉ
  referralCode?: string; // Mã giới thiệu
  uplineId?: string; // ID tuyến trên
  rank: string; // Cấp bậc (Đồng, Bạc,...)
  totalIncome: number; // Tổng thu nhập đã nhận
  maxIncome: number; // Giới hạn thu nhập
  status: string; // Trạng thái (active/suspended)
  wallets: {
    consumptionWallet: number; // Ví tiêu dùng
    sharingWallet: number; // Ví đồng chia
    levelWallet: number; // Ví cấp bậc
    agencyWallet: number; // Ví đại lý
    globalWallet: number; // Ví tổng
  };
  createdAt: Date; // Ngày tạo tài khoản
  updatedAt: Date; // Ngày cập nhật
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    idCard: { type: String, required: true },
    dateOfBirth: { type: Date }, // Ngày sinh
    nationality: { type: String, default: 'Việt Nam' }, // Quốc gia
    region: { type: String }, // Khu vực
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác' }, // Giới tính
    phoneNumber: { type: String, required: true },
    companyPhone: { type: String }, // Số điện thoại công ty
    homePhone: { type: String }, // Số điện thoại nhà riêng
    email: { type: String }, // Email
    address: { type: String }, // Địa chỉ
    referralCode: { type: String },
    uplineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rank: { type: String, enum: ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Lãnh Đạo'], default: 'Đồng' },
    totalIncome: { type: Number, default: 0 },
    maxIncome: { type: Number, default: 10000000 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    wallets: {
      consumptionWallet: { type: Number, default: 0 },
      sharingWallet: { type: Number, default: 0 },
      levelWallet: { type: Number, default: 0 },
      agencyWallet: { type: Number, default: 0 },
      globalWallet: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);