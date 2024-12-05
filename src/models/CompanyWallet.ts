import { Schema, model } from 'mongoose';

const companyWalletSchema = new Schema({
    companyName: { type: String, required: true }, // Tên công ty
    stockWallet: { type: Number, required: true, default: 0 }, // Ví tiền hàng
    profitWallet: { type: Number, required: true, default: 0 }, // Ví lợi nhuận
    sharedWallet: { type: Number, required: true, default: 0 }, // Ví hệ thống chia thưởng
    createdAt: { type: Date, default: () => new Date() }, // Ngày tạo
    updatedAt: { type: Date, default: () => new Date() } // Ngày cập nhật
});

// Middleware để tự động cập nhật `updatedAt`
companyWalletSchema.pre('save', function (next) {
    this.updatedAt = new Date(); // Sử dụng Date thay vì number
    next();
});

// Xuất model
export const CompanyWallet = model('CompanyWallet', companyWalletSchema);
