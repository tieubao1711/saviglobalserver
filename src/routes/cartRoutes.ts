import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import { Cart, ICartPopulatedItem } from '../models/CartItem';
import { authenticate } from '../middlewares/authMiddleware';
import { Order } from '../models/Order';

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
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ status: 'error', message: 'Cart is empty' });
            return;
        }

        cart.items = [];
        cart.totalTransactions = 0;
        cart.totalPrice = 0;
        await cart.save();

        const order = await Order.create({
            userId: userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            status: 'Completed',
        });

        res.json({ status: 'success', message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

router.delete('/carts/:productId', authenticate, async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400).json({ status: 'error', message: 'Invalid productId' });
        return;
    }

    try {
        // Lấy userId từ phiên đăng nhập
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            res.status(404).json({ status: 'error', message: 'Cart not found' });
            return;
        }

        // Tìm sản phẩm trong giỏ hàng
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex === -1) {
            res.status(404).json({ status: 'error', message: 'Product not found in cart' });
            return;
        }

        // Giảm tổng giá và xóa sản phẩm khỏi giỏ hàng
        const removedItem = cart.items.splice(existingItemIndex, 1)[0];
        cart.totalPrice -= removedItem.totalPrice;

        // Cập nhật giỏ hàng
        await cart.save();

        res.json({ status: 'success', message: 'Product removed from cart' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

export default router;
