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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1711;

app.use(session({
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
app.use(cors());
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
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api', cartRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
