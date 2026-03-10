const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');















// Serve the workout page
// GET /workouts
// Purpose: Shows the workout tracking page to logged-in users
router.get('/', isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'web', 'weight.html'));
});











//create a new workout (
// POST /workouts
// Purpose: Creates a new empty workout plan for a user
// Body: { workoutName: "Push Day", userId: "12345" }
// Returns: { success: true, workout: { _id, workoutName, exercises: [] } }
router.post('/', async (req, res) => {
 try {

  // Get data from request body
  const { workoutName, userId } = req.body;
  
  // Validate required fields
  if (!workoutName || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Workout name and user ID are required'
    });
  }

  // Find the user in database
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Create new workout and add to user's workouts array
  user.workouts.push({
    workoutName: workoutName,
    // Start with empty exercises array
    exercises: []
  });

  // Save the updated user document
  await user.save();

  // Get the newly created workout (last item in array)
  const newWorkout = user.workouts[user.workouts.length - 1];


  // Send back the created workout
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


//Gets the whole array of Sets (setNumber, weight, reps)
router.get('/users/:userId/workouts/:workoutId/exercises/:exerciseId/sets', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.sets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})


//Checks for user then sends the setNumber, weight, reps to be stored
router.post('/users/:userId/workouts/:workoutId/exercises/:exerciseId/sets', async (req, res) => {
  try {
    const { userId, workoutId, exerciseId } = req.params;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    const exercise = workout.exercises.find(ex => ex.exerciseId === exerciseId)
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }


    const { setNumber, weight, reps, time } = req.body;

    if (!setNumber || !weight || !reps) {
      return res.status(400).json({ message: "Weight and Reps are required" });
    }

    exercise.sets.push({ setNumber, weight, reps, time });
    await user.save();

    res.json(exercise.sets);


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})








// Get all workouts for a user
// GET /workouts/users/:userId/workouts
// Purpose: Returns all workout plans for a specific user
// Example: GET /workouts/users/12345/workouts
// Returns: { success: true, workouts: [...] }
router.get('/users/:userId/workouts', async (req, res) => {
  try {
    // Get userId from URL parameter
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return all user's workouts
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











// Get a specific workout by ID
// GET /workouts/users/:userId/workouts/:workoutId
// Purpose: Returns a single workout plan with all its exercises
// Example: GET /workouts/users/12345/workouts/67890
// Returns: { success: true, workout: { workoutName, exercises: [...] } }
router.get('/users/:userId/workouts/:workoutId', async (req, res) => {
  try {
    // Get both IDs from URL parameters
    const { workoutId, userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    // Find specific workout within user's workouts array using Mongoose .id() method
    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ 
        success: false,
        error: "Workout not found"
      });
    }

    // Return the workout
    res.json({
      success: true,
      workout
    });

    } catch (error) {
    console.error('Eror fetching workout: ', error);
    res.status(500).json({ error: error.message });
  }
})









// Add an exercise to a workout
// POST /workouts/users/:userId/workouts/:workoutId/add-exercise
// Purpose: Adds a new exercise to an existing workout plan
// Body: { exerciseId, bodyParts, gifUrl, targetMuscles, secondaryMuscles }
// Returns: { success: true, workout: { ... } }
router.post("/users/:userId/workouts/:workoutId/add-exercise", async (req, res) => {
  try {

    const { workoutId, userId } = req.params;

    // Get exercise data from request body
    const { exerciseId, bodyParts, gifUrl, targetMuscles, secondaryMuscles } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found"});
    }

    // Find the specific workout within user's workouts array
    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Create new exercise object
    const newExercise = {
      exerciseId,
      bodyParts,
      gifUrl, 
      targetMuscles,
      secondaryMuscles,
      // Will be empty initially, user adds sets later
      sets: []
    };

    //Adds the exercise to workou's exercise array
    workout.exercises.push(newExercise);

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








// Remove an exercise from a workout
// DELETE /workouts/users/:userId/workouts/:workoutId/exercises/:exerciseId
// Purpose: Removes a specific exercise from a workout plan
// Example: DELETE /workouts/users/12345/workouts/67890/exercises/bench-press
// Returns: { success: true, message: "Exercise removed" }
router.delete('/users/:userId/workouts/:workoutId/exercises/:exerciseId', async (req, res) => {
  try {
    const { userId, workoutId, exerciseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const workout = user.workouts.id(workoutId);
    if (!workout) {
      return res.status(404).json({ success: false, message: "Workout not found" });
    }

    // Filter out the exercise with matching exerciseId
    // .filter() creates a new array excluding the exercise to delete
    workout.exercises = workout.exercises.filter(
      ex => ex.exerciseId !== exerciseId
    );

    await user.save();

    // Confirm deletion
    res.json({ 
      success: true,
      message: "Exercise removed",
    });


  } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
  }
})









// Delete ALL workouts for a user
router.delete('/users/:userId/workouts', async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
  
  // Clear the workouts array (empty array = all deleted)
  user.workouts = [];
  await user.save();
  
  res.json({ success: true, message: "All routines deleted"});
});

module.exports = router;
