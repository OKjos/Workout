const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  email: { type: String },
  workouts: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
    workoutName: String,
      exercises: [
    {
      exerciseId: { type: String, required: true },
      bodyParts: { type: [String], required: true },
      gifUrl: { type: String },
      targetMuscles: { type: [String]},
      secondaryMuscles: { type: [String] }
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now }
  }],
    foods: [
        {
            foodName : { 
                type: String, 
                required: true
            },
            image: {
                type: String
            },
            servingSize: { 
                type: String,
                required: true 
            },
            macros: {
                calories: { 
                    type: Number,
                    required: true
                },
                protein: {
                    type: Number,
                    required: true
                },
                carbs: {
                    type: Number,
                    required: true
                },
                fats: {
                    type: Number,
                    required: true
                }
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;
