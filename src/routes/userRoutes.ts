import express from 'express';
import User from '../models/User';

const router = express.Router();

// Create a new user
router.post('/users', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const newUser = new User({ name, email, password });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
});  

export default router;
