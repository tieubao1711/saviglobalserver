import express from 'express';
import svgCaptcha from 'svg-captcha';

const router = express.Router();

// Generate a CAPTCHA
router.get('/getCaptcha', async (req, res) => {
  try {
    // Create the CAPTCHA
    const captcha = svgCaptcha.create({
      size: 5,
      charPreset: '0123456789', // Chỉ sử dụng số
      noise: 0,
      color: false,
    });

    // Save the CAPTCHA text in the session or other storage
    (req as any).session = (req as any).session || {}; // Simulate session
    (req as any).session.captcha = captcha.text;

    // Respond with the CAPTCHA SVG
    res.type('svg');
    res.status(200).send(captcha.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
