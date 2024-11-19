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
exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const uplineHistory_1 = __importDefault(require("../models/uplineHistory"));
const SALT_ROUNDS = 10;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, fullName, idCard, phoneNumber, referralCode } = req.body;
        const existingUser = yield User_1.default.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Tài khoản đã tồn tại' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        let uplineId = undefined;
        if (referralCode) {
            const uplineUser = yield User_1.default.findOne({ referralCode });
            if (!uplineUser) {
                res.status(400).json({ error: 'Mã giới thiệu không hợp lệ' });
                return;
            }
            uplineId = uplineUser._id;
        }
        const newUser = new User_1.default({
            username,
            password: hashedPassword,
            fullName,
            idCard,
            phoneNumber,
            referralCode,
            uplineId,
            rank: 'Đồng',
        });
        yield newUser.save();
        if (uplineId) {
            yield uplineHistory_1.default.create({
                userId: newUser._id,
                uplineId,
            });
        }
        res.status(201).json({ message: 'Đăng ký thành công', user: { username, fullName, phoneNumber } });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
    }
});
exports.register = register;
