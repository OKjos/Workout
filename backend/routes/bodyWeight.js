const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');


router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'profile', 'profile.html'));
});


router.get('/users/:userId/bodyWeight', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.bodyWeight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/users/:userId/bodyWeight', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.bodyWeight.push({ dailyWeight: req.body.dailyWeight })
        await user.save();

        res.json(user.bodyWeight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;