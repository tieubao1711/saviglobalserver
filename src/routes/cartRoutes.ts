import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import { Cart, ICartPopulatedItem } from '../models/CartItem';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Add to Cart
router.post('/carts', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId) || quantity <= 0) {
        res.status(400).json({ status: 'error', message: 'Invalid productId or quantity' });
        return;
    }

    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(productId) as IProduct | null;
        if (!product) {
            res.status(404).json({ status: 'error', message: 'Product not found' });
            return;
        }

        // Giả định userId được lấy từ phiên đăng nhập
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                totalTransactions: 0,
                totalPrice: 0,
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice += product.price * quantity;
        } else {
            cart.items.push({
                productId: new mongoose.Types.ObjectId(productId), 
                quantity: quantity,
                totalPrice: product.price * quantity, 
            } as any);
              
          
            cart.totalTransactions++;
        }

        cart.totalPrice += product.price * quantity;
        await cart.save();

        res.json({ status: 'success', message: 'Product added to cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Get Cart
router.get('/carts', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        // Tìm giỏ hàng và populate productId
        const cart = await Cart.findOne({ userId })
            .populate<{ items: ICartPopulatedItem[] }>('items.productId', 'name price');


        if (!cart) {
            res.status(404).json({ status: 'error', message: 'Cart not found' });
            return;
        }

        // Sử dụng kiểu dữ liệu ICartPopulatedItem
        const data = cart.items.map((item: ICartPopulatedItem) => ({
            productId: item.productId._id, // Sử dụng _id từ IProduct
            name: item.productId.name, // Truy cập thông tin name từ IProduct
            quantity: item.quantity,
            totalPrice: item.totalPrice,
        }));

        res.json({ status: 'success', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Checkout
router.post('/carts/checkout', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { paymentMethod, address } = req.body;

    if (!paymentMethod || !address) {
        res.status(400).json({ status: 'error', message: 'Missing paymentMethod or address' });
        return;
    }

    try {
        const userId = (req as any).user.id;

        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ status: 'error', message: 'Cart is empty' });
            return;
        }

        const order = {
            orderId: new mongoose.Types.ObjectId().toString(),
            userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            paymentMethod,
            address,
            createdAt: new Date(),
        };

        cart.items = [];
        cart.totalTransactions = 0;
        cart.totalPrice = 0;
        await cart.save();

        // Giả định rằng bạn sẽ lưu `order` vào collection "Order" (chưa được triển khai)

        res.json({ status: 'success', message: 'Order placed successfully', orderId: order.orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

export default router;
