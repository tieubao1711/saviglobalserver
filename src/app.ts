import express from 'express';
import testRoutes from './routes/testRoutes'; // Import test routes
import { connectDB } from './testDemo'; // Import hàm connectDB
import cors from 'cors';
import binaryTree from './routes/binaryTreeRoutes';

const app = express();
const PORT = 1711;

// Kết nối MongoDB trước khi khởi động server
async function startServer() {
  try {
    // Kết nối tới MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');

    app.use(cors()); // Cho phép tất cả các nguồn
    app.use(express.json()); // Middleware

    // Routes
    app.use('/api', testRoutes);
    app.use('/api', binaryTree);

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // Thoát nếu không thể kết nối
  }
}

startServer();
