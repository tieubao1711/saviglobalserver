import mongoose, { Types } from 'mongoose';
import cron from 'node-cron';
import schedule from 'node-schedule';
import { Point } from './models/Point';
import { BinaryTree, IBinaryTree } from './models/BinaryTree';
import { distributeProfit } from './services/profit/distributeProfit';
import User from './models/User';
import { Order } from './models/Order';

// Kết nối MongoDB
export async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/demo-test');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Tạo dữ liệu giả
export async function generateFakeData() {
  try {
    console.log('Deleting old data...');
    await User.deleteMany({});
    await Point.deleteMany({});
    await BinaryTree.deleteMany({});
    await Order.deleteMany({});
    console.log('Old data deleted successfully.');

    console.log('Generating fake data...');
    const binaryTreeNodes = [];

    for (let i = 1; i <= 100; i++) {
      // Tạo User
      const user = await User.create({
        username: `User${i}`,
        password: 'hashed_password',
        fullName: `User FullName ${i}`,
        idCard: `IDCard${i}`,
        dateOfBirth: new Date(1990, 0, i % 30 + 1),
        nationality: 'Việt Nam',
        region: 'Hà Nội',
        gender: i % 2 === 0 ? 'Nam' : 'Nữ',
        phoneNumber: `090000000${i}`,
        email: `user${i}@example.com`,
        address: `Address ${i}`,
        referralCode: `REF${i}`,
        rank: `SAVI ${i % 6 + 1}`,
        totalIncome: 0,
        maxIncome: 10000000,
        status: 'active',
        wallets: {
          consumptionWallet: 0,
          sharingWallet: 0,
          levelWallet: 0,
          agencyWallet: 0,
          globalWallet: 0,
        },
      });

      // Tạo danh sách sản phẩm cố định
      const items = [
        {
          productId: new mongoose.Types.ObjectId(), // ID giả định
          quantity: 1, // Số lượng cố định
          price: 6400000, // Giá mỗi sản phẩm
        },
      ];

      // Tính tổng giá trị đơn hàng (luôn là tổng của danh sách sản phẩm)
      const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

      // Tạo Order
      const order = await Order.create({
        userId: user._id,
        items,
        totalPrice,
        status: 'Completed', // Đơn hàng luôn hoàn thành
      });

      // Tạo Point
      const point = await Point.create({
        userId: user._id,
        orderId: order._id,
      });

      // Tạo BinaryTree node (chỉ lưu tạm để điền cây sau)
      const binaryTreeNode = await BinaryTree.create({
        pointId: point._id,
        parentId: null,
        leftChildId: null,
        rightChildId: null,
        depth: 1,
      });

      binaryTreeNodes.push(binaryTreeNode);
    }

    console.log('Fake data created successfully.');

    // Hoàn thiện cây BinaryTree
    console.log('Filling BinaryTree...');
    await completeBinaryTree(binaryTreeNodes);
    console.log('BinaryTree completed successfully.');
  } catch (error) {
    console.error('Error generating fake data:', error);
  }
}

// Hàm hoàn thiện BinaryTree
async function completeBinaryTree(nodes: IBinaryTree[]) {
  const queue: IBinaryTree[] = []; // Hàng đợi các node để gán con
  let currentDepth = 1;

  // Gắn root node
  const rootNode = nodes.shift();
  if (rootNode) {
    rootNode.depth = currentDepth;
    await rootNode.save();
    queue.push(rootNode);
  }

  while (nodes.length > 0) {
    const parentNode = queue.shift(); // Lấy node cha từ hàng đợi
    if (!parentNode) break;

    // Gắn con trái
    if (nodes.length > 0) {
      const leftChild = nodes.shift();
      if (leftChild) {
        leftChild.parentId = parentNode._id as Types.ObjectId; // Ép kiểu rõ ràng
        leftChild.depth = parentNode.depth + 1;
        parentNode.leftChildId = leftChild._id as Types.ObjectId; // Ép kiểu rõ ràng
      
        await leftChild.save();
        queue.push(leftChild); // Đưa con trái vào hàng đợi
      }
      
    }

    // Gắn con phải
    if (nodes.length > 0) {
      const rightChild = nodes.shift();
      if (rightChild) {
        rightChild.parentId = parentNode._id as Types.ObjectId; // Ép kiểu rõ ràng
        rightChild.depth = parentNode.depth + 1;
        parentNode.rightChildId = rightChild._id as Types.ObjectId; // Ép kiểu rõ ràng
      
        await rightChild.save();
        queue.push(rightChild); // Đưa con phải vào hàng đợi
      }
      
    }

    // Lưu node cha sau khi cập nhật
    await parentNode.save();
  }
}

// Tạo Cron Job
export function setupCronJob() {
  schedule.scheduleJob('*/10 * * * * *', async () => {
    try {
      console.log('Running profit distribution test...');
      await distributeProfit(); // Gọi hàm phân phối lợi nhuận
      console.log('Profit distribution test completed.');
    } catch (error) {
      console.error('Error during profit distribution:', error);
    }
  });
}
