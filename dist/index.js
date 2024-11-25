"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // Import cors
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const captchaRoutes_1 = __importDefault(require("./routes/captchaRoutes"));
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, express_session_1.default)({
    secret: process.env.CAPTCHA_SECRET || 'captcha_secret', // Khóa bí mật
    resave: false, // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true, // Lưu session ngay cả khi không có dữ liệu
    cookie: { secure: false } // Đặt `true` nếu sử dụng HTTPS
}));
// Middleware
app.use((0, cors_1.default)()); // Bật CORS cho tất cả các nguồn
app.use(express_1.default.json());
// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saviglobal';
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Routes
app.get('/', (req, res) => {
    res.send('Hello, TypeScript with MongoDB!');
});
app.use('/api', captchaRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
