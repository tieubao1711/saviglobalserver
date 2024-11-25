import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import captchaRoutes from './routes/captchaRoutes';
import session from 'express-session';

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


// Middlewarea
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép tất cả các nguồn (hoặc xử lý logic kiểm tra origin nếu cần)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
  credentials: true // Cho phép gửi cookie và header `Authorization`
}));

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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
