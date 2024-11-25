import express from 'express';
import svgCaptcha from 'svg-captcha';

const router = express.Router();

// Generate a CAPTCHA
router.get('/getCaptcha', async (req, res) => {
  try {
    // Create the CAPTCHA
    const captcha = svgCaptcha.create({
      size: 6, // Number of characters
      noise: 3, // Noise level
      color: true, // Use colored text
      background: '#f7f7f7', // Background color
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
