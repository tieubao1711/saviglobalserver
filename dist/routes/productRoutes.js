"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const router = express_1.default.Router();
// Lấy danh sách sản phẩm
router.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.default.find();
        res.status(200).json({
            status: 'success',
            data: products,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server, vui lòng thử lại sau.',
        });
    }
}));
// Thêm sản phẩm
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, price, description, imageUrl, currency } = req.body;
        // Tạo sản phẩm mới
        const newProduct = new Product_1.default({
            name,
            code,
            price,
            description,
            imageUrl,
            currency,
        });
        yield newProduct.save();
        res.status(201).json({
            status: 'success',
            data: newProduct,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server, không thể thêm sản phẩm.',
        });
    }
}));
// Sửa sản phẩm
router.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Cập nhật sản phẩm
        const updatedProduct = yield Product_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            res.status(404).json({
                status: 'error',
                message: 'Sản phẩm không tồn tại.',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: updatedProduct,
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server, không thể cập nhật sản phẩm.',
        });
    }
}));
// Xóa sản phẩm
router.delete('/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Xóa sản phẩm
        const deletedProduct = yield Product_1.default.findByIdAndDelete(id);
        if (!deletedProduct) {
            res.status(404).json({
                status: 'error',
                message: 'Sản phẩm không tồn tại.',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Sản phẩm đã được xóa.',
        });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server, không thể xóa sản phẩm.',
        });
    }
}));
exports.default = router;
