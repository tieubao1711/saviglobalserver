"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = exports.Cart = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CartItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true }, // Tham chiếu Product
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true }, // Sẽ được tính khi thêm sản phẩm vào giỏ
    totalPv: { type: Number, required: true }, // Sẽ được tính khi thêm sản phẩm vào giỏ
});
const CartSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema], // Danh sách sản phẩm
    totalTransactions: { type: Number, default: 0 }, // Tổng giao dịch
    totalPrice: { type: Number, default: 0 }, // Tổng số tiền
    totalPv: { type: Number, default: 0 }, // Tổng PV
}, { timestamps: true });
exports.Cart = mongoose_1.default.model('Cart', CartSchema);
exports.CartItem = mongoose_1.default.model('CartItem', CartItemSchema);
