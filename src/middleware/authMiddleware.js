"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret key để xác thực token
const JWT_SECRET = process.env.JWT_SECRET || 'ddb20b53-f023-4033-b2b5-6f1bfeeb1528';
// Middleware xác thực
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Kiểm tra xem token có được cung cấp không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token không được cung cấp' });
        return;
    }
    const token = authHeader.split(' ')[1]; // Lấy token sau "Bearer"
    try {
        // Xác thực token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Gắn thông tin người dùng vào req để sử dụng trong các API tiếp theo
        req.user = decoded;
        next(); // Tiếp tục xử lý API
    }
    catch (err) {
        res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};
exports.authenticate = authenticate;
