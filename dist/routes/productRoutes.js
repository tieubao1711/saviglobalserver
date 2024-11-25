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
router.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy danh sách tất cả sản phẩm từ MongoDB
        const products = yield Product_1.default.find();
        // Trả về danh sách sản phẩm
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
exports.default = router;
