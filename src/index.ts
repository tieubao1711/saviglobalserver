import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import authRoutes from './routes/authRoutes';
import captchaRoutes from './routes/captchaRoutes';
import session from 'express-session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: process.env.CAPTCHA_SECRET || 'captcha_secret', // Khóa bí mật
  resave: false, // Không lưu lại session nếu không có thay đổi
  saveUninitialized: true, // Lưu session ngay cả khi không có dữ liệu
  cookie: { secure: false } // Đặt `true` nếu sử dụng HTTPS
}));

// Middleware
app.use(cors()); // Bật CORS cho tất cả các nguồn
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saviglobal';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Hello, TypeScript with MongoDB!');
});

app.use('/api', captchaRoutes);
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
