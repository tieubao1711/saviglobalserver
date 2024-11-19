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
exports.calculateDailyRewards = void 0;
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const calculateDailyRewards = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find();
    for (const user of users) {
        if (user.totalIncome >= user.maxIncome) {
            user.status = 'suspended';
            yield user.save();
            continue;
        }
        let totalReward = 0;
        if (user.uplineId) {
            const uplineUser = yield User_1.default.findById(user.uplineId);
            if (uplineUser) {
                const reward = uplineUser.totalIncome * 0.05; // 5% từ tuyến trên
                totalReward += reward;
            }
        }
        user.wallets.consumptionWallet += totalReward;
        user.totalIncome += totalReward;
        yield user.save();
        yield Transaction_1.default.create({
            userId: user._id,
            type: 'thưởng',
            amount: totalReward,
            description: 'Thu nhập từ tuyến trên',
        });
    }
});
exports.calculateDailyRewards = calculateDailyRewards;
