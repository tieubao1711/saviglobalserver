import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import captchaRoutes from './routes/captchaRoutes';
import cartRoutes from './routes/cartRoutes';
import session from 'express-session';
import cors from 'cors';
import testRoutes from './routes/testRoutes'; // Import test routes
import binaryTreeRoutes from './routes/binaryTreeRoutes';
import adminRoutes from './routes/adminRoutes';
import initData from './configs/initdata';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1711;

// Cấu hình CORS chỉ cho phép truy cập từ localhost:3000 và saviglobal.xyz
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Cái này sẽ cho phép frontend localhost
    'https://saviglobal.xyz', // Cái này cho phép frontend production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức mà bạn cho phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header mà bạn cho phép
  credentials: true, // Cho phép gửi cookie từ client
};

app.use(cors(corsOptions));  // Sử dụng CORS với options đã cấu hình

// Session middleware
app.use(session({
  secret: process.env.CAPTCHA_SECRET || 'captcha_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Đặt true nếu sử dụng HTTPS
    httpOnly: false, // Cho phép truy cập từ phía client
    sameSite: 'lax' // Hoặc 'none' nếu sử dụng HTTPS
  }
}));

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

app.use('/api/admin', adminRoutes);
app.use('/api', testRoutes);
app.use('/api', cartRoutes);
app.use('/api', captchaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/binary-tree', binaryTreeRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// initialize base data
initData();
