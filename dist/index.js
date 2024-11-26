"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const captchaRoutes_1 = __importDefault(require("./routes/captchaRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 1711;
app.use((0, express_session_1.default)({
    secret: process.env.CAPTCHA_SECRET || 'captcha_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Đặt `true` nếu sử dụng HTTPS
        httpOnly: false, // Cho phép truy cập từ phía client
        sameSite: 'lax' // Hoặc 'none' nếu sử dụng HTTPS
    }
}));
// cors?
app.use((0, cors_1.default)());
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
app.use('/api/users', userRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
