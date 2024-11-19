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
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Wallet_1 = __importDefault(require("../models/Wallet"));
const JWT_SECRET = process.env.JWT_SECRET || 'ddb20b53-f023-4033-b2b5-6f1bfeeb1528';
const router = express_1.default.Router();
// API Đăng ký thành viên
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, fullName, idCard, phoneNumber, referralCode } = req.body;
        // Kiểm tra tài khoản đã tồn tại
        const existingUser = yield User_1.default.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Tài khoản đã tồn tại' });
            return;
        }
        // Hash mật khẩu
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Tạo người dùng mới
        const newUser = new User_1.default({
            username,
            password: hashedPassword,
            fullName,
            idCard,
            phoneNumber,
            referralCode,
            rank: 'Đồng', // Mặc định cấp bậc là Đồng
            totalIncome: 0,
            maxIncome: 10000000, // Mặc định giới hạn thu nhập
        });
        // Lưu người dùng vào cơ sở dữ liệu
        yield newUser.save();
        // Tạo các loại ví cho người dùng
        const walletTypes = ['tiền hàng', 'đồng chia', 'cấp bậc', 'đại lý', 'tổng'];
        const wallets = walletTypes.map((type) => ({
            userId: newUser._id,
            type,
            balance: 0,
        }));
        yield Wallet_1.default.insertMany(wallets);
        res.status(201).json({ message: 'Đăng ký thành công', user: { username, fullName, phoneNumber } });
    }
    catch (err) {
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
    }
}));
// API Đăng nhập
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Kiểm tra tài khoản có tồn tại không
        const user = yield User_1.default.findOne({ username });
        if (!user) {
            res.status(400).json({ error: 'Tài khoản không tồn tại' });
            return;
        }
        // So sánh mật khẩu
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Sai mật khẩu' });
            return;
        }
        // Tạo token JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, // Payload
        JWT_SECRET, // Secret key
        { expiresIn: '1h' } // Thời gian hết hạn
        );
        res.status(200).json({ message: 'Đăng nhập thành công', token });
    }
    catch (err) {
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
    }
}));
exports.default = router;
