require('dotenv').config();
const connectDB = require('./config/config');

const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

connectDB.then(() => console.log('✅ DB connected'));

// Enable user sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));






app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));





// Routes
// /user/* routes (login, logout, etc.)
app.use('/user', require('./routes/users'));
// /profile/* routes (user profile page)
app.use('/profile', require('./routes/profile'));
// /register/* routes (signup)
app.use('/register', require('./routes/register'));
// /workouts/* routes (workout tracking)
app.use('/workouts', require('./routes/workouts'));
// /home/* routes (dashboard)
app.use('/home', require('./routes/home'));
// /food/* routes (nutrition tracking)
app.use('/food', require('./routes/food'));


















// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'login.html'));
});




// Frontend can check who's logged in
// Returns: { _id, username } or 401 error if not logged in
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
  res.sendFile(path.join(__dirname, '..', 'web', 'home.html'));
})



// ROUTE: Search for food from OpenFoodFacts API
// GET /api/food?q=chicken
// Purpose: When user searches for food, this fetches data from external API
// Query param: q = search term (e.g., "chicken breast")
// Returns: Food data with nutrition info
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

//Start server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}`);
});


