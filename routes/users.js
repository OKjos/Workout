const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// ----- LOGIN -----
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.send('<p>User not found</p><a href="/">Go back</a>');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send('<p>Wrong password</p><a href="/">Go back</a>');

        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect('/home');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ----- GET USER BY ID -----
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password'); // exclude password
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
