const express = require('express');
const router = express.Router();
const path = require('path');
const { isLoggedIn } = require('../middleware/auth');

router.get('/', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

module.exports = router;