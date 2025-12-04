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
            },
            createdAt: new Date()
        };



        user.foods.push(newFood);


        await user.save();


        res.json({ success: true, foods: user.foods });


    } catch (err) {
        console.error("❌ FINAL ERROR:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});


router.get('/users/:userId/foods', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('foods');

        res.json({ foods: user.foods });
    } catch (error) {

        console.error("Error fetching foods: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get('/users/:userId/foods-today', async (req, res) => {
    try {
        const { userId } = req.params;


        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found "});
        }


        const todaysFoods = user.foods.filter(f => {
            const created = new Date(f.createdAt);
            const createdDate = created.toISOString().split('T')[0]; // "YYYY-MM-DD"
            const todayDate = new Date().toISOString().split('T')[0];
            return createdDate === todayDate;
        });

        res.status(200).json({ foods: todaysFoods });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;