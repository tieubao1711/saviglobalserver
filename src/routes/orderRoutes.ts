import express, { Request, Response } from 'express';
import { Order } from '../models/Order'; // Import Order model
import { Point } from '../models/Point'; // Import Point model
import { BinaryTree } from '../models/BinaryTree'; // Import BinaryTree model
import Product from '../models/Product';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * 1. Create a new order
 * URL: /orders
 * Method: POST
 * Body: { userId, items: [{ productId, quantity }] }
 */
router.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const { userId, items } = req.body;

  try {
    // Validate input
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ status: 'error', message: 'Invalid input' });
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({ status: 'error', message: 'Product not found' });
        return;
      }
      totalPrice += product.price * item.quantity;
    }

    // Create the order
    const newOrder = new Order({
      userId,
      items,
      totalPrice,
      status: 'Completed',
    });
    await newOrder.save();

    // Add a point to the user
    const newPoint = new Point({
      userId,
      orderId: newOrder._id,
      treePosition: null, // Will be updated later
    });
    await newPoint.save();

    // Assign the point to the binary tree
    const emptyNode = await BinaryTree.findOne({ pointId: null }).sort({ depth: 1 });
    if (emptyNode) {
        emptyNode.pointId = newPoint._id as mongoose.Types.ObjectId; // Ép kiểu rõ ràng
        await emptyNode.save();

        // Cập nhật treePosition trong Point
        newPoint.treePosition = emptyNode._id as mongoose.Types.ObjectId;
        await newPoint.save();
    }


    res.status(201).json({ status: 'success', message: 'Order created', orderId: newOrder._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/**
 * 2. Get all orders for a user
 * URL: /orders
 * Method: GET
 * Query: userId
 */
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  try {
    // Validate input
    if (!userId) {
      res.status(400).json({ status: 'error', message: 'UserId is required' });
      return;
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json({ status: 'success', data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/**
 * 3. Get details of a specific order
 * URL: /orders/:id
 * Method: GET
 */
router.get('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (!id) {
      res.status(400).json({ status: 'error', message: 'Order ID is required' });
      return;
    }

    const order = await Order.findById(id).populate('items.productId', 'name price');
    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    res.json({ status: 'success', data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
