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
const svg_captcha_1 = __importDefault(require("svg-captcha"));
const router = express_1.default.Router();
// Generate a CAPTCHA
router.get('/getCaptcha', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create the CAPTCHA
        const captcha = svg_captcha_1.default.create({
            size: 6, // Number of characters
            noise: 3, // Noise level
            color: true, // Use colored text
            background: '#f7f7f7', // Background color
        });
        // Save the CAPTCHA text in the session or other storage
        req.session = req.session || {}; // Simulate session
        req.session.captcha = captcha.text;
        // Respond with the CAPTCHA SVG
        res.type('svg');
        res.status(200).send(captcha.data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
