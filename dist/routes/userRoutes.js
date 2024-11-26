"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
router.get('/me', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy thông tin user từ token (được gắn trong middleware authenticate)
        const userId = req.user.id;
        // Tìm user trong database
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
            return;
        }
        // Trả về thông tin user
        res.status(200).json({
            status: 'success',
            data: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                idCard: user.idCard,
                dateOfBirth: user.dateOfBirth,
                nationality: user.nationality,
                region: user.region,
                gender: user.gender,
                phoneNumber: user.phoneNumber,
                companyPhone: user.companyPhone,
                homePhone: user.homePhone,
                email: user.email,
                address: user.address,
                referralCode: user.referralCode,
                uplineId: user.uplineId,
                rank: user.rank,
                totalIncome: user.totalIncome,
                maxIncome: user.maxIncome,
                status: user.status,
                wallets: user.wallets,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}));
router.post('/change-password', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!currentPassword || !newPassword) {
            res.status(400).json({ status: 'error', message: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.' });
            return;
        }
        // Lấy thông tin người dùng từ token
        const userId = req.user.id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ status: 'error', message: 'Người dùng không tồn tại.' });
            return;
        }
        // Kiểm tra mật khẩu hiện tại
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Mật khẩu hiện tại không chính xác.' });
            return;
        }
        // Mã hóa mật khẩu mới
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Cập nhật mật khẩu mới vào database
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ status: 'success', message: 'Đổi mật khẩu thành công.' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: 'Lỗi server, vui lòng thử lại sau.' });
    }
}));
exports.default = router;
