const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');
















//Route that serves the workout page it requires the user to be logged in
router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'weight.html'));
});











//create a new workout (index.js submitRoutine --> This)
router.post('/', async (req, res) => {
 try {

  //Gets the data from req body
  const { workoutName, userId } = req.body;
  
  //Validates the required fields
  if (!workoutName || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Workout name and user ID are required'
    });
  }

  //Makes sure the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  //Create a new workout doc
  user.workouts.push({
    workoutName: workoutName,
    exercises: []
  });

  await user.save();

  const newWorkout = user.workouts[user.workouts.length - 1];


  res.status(201).json({
    success: true,
    message: 'Workout created successfully',
    workout: newWorkout
  });

 } catch (error) {
    console.error('Error creating workout: ', error); 
    res.status(500).json({
    success: false,
    message: 'Server error while creating workout',
    error: error.message
  });
 }
});











//returns all users workout plans
router.get('/users/:userId/workouts', async (req, res) => {
  try {
    const { userId } = req.params;

    //Finds the workouts by user ID then sorts by creation date (new to oldest)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      workouts: user.workouts
    });
  } catch (error) {
  console.error('Error creating workout: ', error); 
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workouts',
      error: error.message
    });
  }
});











//Get specific workout by ID
router.get('/users/:userId/workouts/:workoutId', async (req, res) => {
  try {
    const { workoutId, userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ 
        success: false,
        error: "Workout not found"
      });
    }

    res.json({
      success: true,
      workout
    });

    } catch (error) {
    Console.error('Eror fetching workout: ', error);
    res.status(500).json({ error: error.message });
  }
})









//add workouts to routine
router.post("/users/:userId/workouts/:workoutId/add-exercise", async (req, res) => {
  try {

    //Gets the workout ID from the URL params
    const { workoutId, userId } = req.params;

    //Gets the exercise data from req body
    const { exerciseId, bodyParts, gifUrl, targetMuscles, secondaryMuscles } = req.body;

    //Find the workout by ID in the DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    //Create a new exercise object
    const newExercise = {
      exerciseId,
      bodyParts,
      gifUrl, 
      targetMuscles,
      secondaryMuscles,
      addedAt: new Date()
    };

    //Adds the exercise to workou's exercise array
    workout.exercises.push(newExercise);

    //Saves the updated workout
    await user.save();

    res.json({ 
      success: true, 
      message: 'Exercise added',
      workout: workout 
    });

  } catch (error) {
    console.error("Error in add-exercise route: ", error);

    res.status(500).json({
      error: "Failed to add exercise",
      details: error.message
    });
  } 
})








//Delete a workout from the routine
router.delete('/users/:userId/workouts/:workoutId/exercises/:exerciseId', async (req, res) => {
  try {
    const { userId, workoutId, exerciseId } = req.params;

    //Find the workout
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ success: false, message: "Workout not found" });
    }

    //Removes the exercise from the array
    workout.exercises = workout.exercises.filter(
      ex => ex.exerciseId !== exerciseId
    );

    await user.save();


    res.json({ 
      success: true,
      message: "Exercise removed",
    });


  } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
  }
})









//delete all user routines
router.delete('/users/:userId/workouts', async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
  
  user.workouts = [];
  await user.save();
  
  res.json({ success: true, message: "All routines deleted"});
});

module.exports = router;
