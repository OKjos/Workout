const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');


router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'food.html'));
});




router.post('/user/:userId/add-to-food', async (req, res) => {
    try {
        const { userId } = req.params;
        const { code, image, servingSize, calories, protein, carbs, foodName, fats } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found "});
        }

        // Add new food to foods array
        const newFood = {
            foodName: foodName, 
            image: image || '',
            servingSize: servingSize || 'Not specified',
            macros: { 
                calories: Number(calories), 
                protein: Number(protein), 
                carbs: Number(carbs),
                fats: Number(fats)
            }
        };



        user.foods.push(newFood);


        await user.save();


        res.json({ 
            message: "Food added successfully", 
            food: newFood
        });

    } catch (err) {
        console.error("❌ FINAL ERROR:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});





module.exports = router;