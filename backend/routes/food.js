const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');


router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'web', 'food.html'));
});



// POST /food/user/:userId/add-to-food
// Purpose: When user selects a food from API search, this saves it to their daily log
// Body: { foodName, image, servingSize, calories, protein, carbs, fats }
router.post('/user/:userId/add-to-food', async (req, res) => {
    try {

        // Get userId from URL parameter (e.g., /food/user/12345/add-to-food)
        const { userId } = req.params;

         // Get food data from request body (sent from frontend)
        const { code, image, servingSize, calories, protein, carbs, foodName, fats } = req.body;


        // Find the user in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found "});
        }

        // Create new food object matching your schema
        const newFood = {
            userId: req.UserId,
            foodName: foodName, 
            image: image || '',
            servingSize: servingSize || 'Not specified',
            macros: { 
                calories: Number(calories), 
                protein: Number(protein), 
                carbs: Number(carbs),
                fats: Number(fats)
            },
        };


        // Add the food to user's foods array
        user.foods.push(newFood);


        // Save the updated user document to MongoDB
        await user.save();


        // Send success response with all user's foods
        res.json({ success: true, foods: user.foods });


    } catch (err) {
        console.error("❌ FINAL ERROR:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});




// GET /food/users/:userId/foods
// Purpose: Returns complete food history (all days, all time)
// Use case: Viewing full history, generating reports, etc.
router.get('/users/:userId/foods', async (req, res) => {
    try {

        // Get userId from URL parameter
        const userId = req.params.userId;

        // Find user and only return their foods array (not password, workouts, etc.)
        const user = await User.findById(userId).select('foods');

        // Return all foods from all days
        res.json({ foods: user.foods });

    } catch (error) {

        console.error("Error fetching foods: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
})


// GET /food/users/:userId/foods-today
// Purpose: Returns only today's foods + calculated macro totals
// Use case: Dashboard showing current day progress
router.get('/users/:userId/foods-today', async (req, res) => {
    try {
        const { userId } = req.params;

        //Define "today" as midnight to 11:59:59 PM
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        //Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found "});
        }


        //Filter user.foods array to only include today's entries
        // This checks each food's createdAt timestamp
        const todaysFoods = user.foods.filter(food => {
            const foodDate = new Date(food.createdAt);
            return foodDate >= startOfToday && foodDate <= endOfDay;

        })

        //Calculate total macros from today's foods
        // reduce loops through todaysFoods and adds up all macros
        const totals = todaysFoods.reduce((acc, food) => {
            acc.calories += food.macros.calories;
            acc.protein += food.macros.protein;
            acc.carbs += food.macros.carbs;
            acc.fats += food.macros.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0});


        //Send back today's foods and their totals
        res.status(200).json({ foods: todaysFoods, totals });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete('/users/:userId/foods/:foodsId', async (req, res) => {
    try {
        const {userId, foodsId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const food = user.foods.id(foodsId);
        if(!food) {
            return res.status(404).json({ success: false, message: "Food not found" });
        }

        food.deleteOne();

        await user.save();

        res.json({
            success: true,
            message: "Food Removed"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


module.exports = router;