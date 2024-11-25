"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
    uplineId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
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
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', UserSchema);
