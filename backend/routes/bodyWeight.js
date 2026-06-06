const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');


router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'profile', 'profile.html'));
});




//Looks up the user in MongoDB by their ID and then returns their entire bodyWeight array
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



//Finds the user and pushes a new dailyWeight object to their bodyWeight array and saves the update
router.post('/users/:userId/bodyWeight', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //req.body.dailyWeight is the weight value sent from the frontend in the requested body
        //.push then sends it back as a new object into the users bodyWeight array
        //user.bodyWeight.push is telling where to go and put the new value coming from the frontend (req.body.dailyWeight)
        user.bodyWeight.push({ dailyWeight: req.body.dailyWeight })
        await user.save();

        res.json(user.bodyWeight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})



router.delete('/users/:userId/bodyWeight/:bodyWeight', async (req, res) => {
    try {
        const {userId, bodyWeight } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ sucess: false, message: "User not found" });
        }

        const bodyW = user.bodyWeight.id(bodyWeight);
        if (!bodyW) {
            return res.status(404).json({ success: false, message: "Body Weight not found" });
        }

        user.bodyWeight = user.bodyWeight.filter(
            ex => ex._id.toString() !== bodyWeight
        );

        await user.save();

        res.json({
            success: true,
            message: "Weight removed"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }

    
})

module.exports = router;