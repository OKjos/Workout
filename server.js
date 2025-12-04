require('dotenv').config();
const connectDB = require('./config/config');

const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB.then(() => console.log('✅ DB connected'));

// Middleware
// Enable user sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));






// Parse form data
app.use(express.urlencoded({ extended: true }));
// Parse JSON data  
app.use(express.json());
// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));





// Routes
//login
app.use('/user', require('./routes/users'));
// User profile pages
app.use('/profile', require('./routes/profile'));
// User registration
app.use('/register', require('./routes/register'));
// Workout-related routes
app.use('/workouts', require('./routes/workouts'));
//Home page
app.use('/home', require('./routes/home'));
//Food page
app.use('/food', require('./routes/food'));


















// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Add this route to server.js (before app.listen)
app.get('/api/current-user', (req, res) => {
  if (req.session.userId) {
    res.json({
      _id: req.session.userId,
      username: req.session.username
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

app.get('/workout', (req, res) => {
  res.redirect('/workouts');
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
})

app.get('/food', (req, res) => {
  res.redirect('/food')
})

app.get("/api/food", async (req, res) => {
    try {
        const query = req.query.q;


        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6&lc=en&cc=us&fields=product_name,image_url,serving_size,energy-kcal_100g,energy-kcal_serving,proteins_100g,proteins_serving,carbohydrates_100g,carbohydrates_serving,fat_100g,fat_serving`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server error" });
    }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}`);
});


