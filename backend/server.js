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

app.use('/body', require('./routes/bodyWeight'))

















// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'login.html'));
});




// Frontend can check who's logged in
// Returns: { _id, username } or 401 error if not logged in
app.get('/api/current-user', async (req, res) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId).select('username profileImage');
    res.json({
      _id: req.session.userId,
      username: req.session.username,
      profileImage: user?.profileImage || ''
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


        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=4&lc=en&cc=us&fields=product_name,image_url,serving_size,energy-kcal_100g,energy-kcal_serving,proteins_100g,proteins_serving,carbohydrates_100g,carbohydrates_serving,fat_100g,fat_serving`;


        const response = await fetch(url);
        console.log(response.status)

        console.log(response.ok)
        const data = await response.json();

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server error" });
    }
});


let _exerciseCache = null;
let _cacheTime = 0;

function extractArray(raw) {
  if (Array.isArray(raw)) return raw;
  for (const key of ['data', 'exercises', 'results', 'items']) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  return [];
}

function strIncludes(field, term) {
  if (!field) return false;
  if (Array.isArray(field)) return field.some(v => String(v).toLowerCase().includes(term));
  return String(field).toLowerCase().includes(term);
}

async function getAllExercises() {
  if (_exerciseCache && Date.now() - _cacheTime < 60 * 60 * 1000) {
    return _exerciseCache;
  }

  // API ignores limit and returns 25 per page — fetch all pages in parallel
  const pageSize = 25;
  const maxPages = 55; // covers ~1375 exercises
  console.log('[exercises] fetching all pages in parallel...');

  const pages = await Promise.allSettled(
    Array.from({ length: maxPages }, (_, i) =>
      fetch(`https://oss.exercisedb.dev/api/v1/exercises?limit=${pageSize}&offset=${i * pageSize}`)
        .then(r => r.ok ? r.json() : [])
        .then(raw => extractArray(raw))
        .catch(() => [])
    )
  );

  const seen = new Set();
  const all = [];
  for (const p of pages) {
    if (p.status !== 'fulfilled') continue;
    for (const ex of p.value) {
      if (ex.exerciseId && !seen.has(ex.exerciseId)) {
        seen.add(ex.exerciseId);
        all.push(ex);
      }
    }
  }

  _exerciseCache = all;
  _cacheTime = Date.now();
  console.log('[exercises] cached', all.length, 'exercises');
  return _exerciseCache;
}

app.get('/api/exercises', async (req, res) => {
  try {
    const { type, input } = req.query;
    if (!type || !input) return res.json({ data: [] });
    const term = input.toLowerCase().trim();

    const all = await getAllExercises();
    console.log(`[exercises] search type=${type} term="${term}" across ${all.length}`);

    let filtered = [];
    if (type === 'name') {
      filtered = all.filter(ex =>
        strIncludes(ex.name, term) ||
        strIncludes(ex.bodyParts ?? ex.bodyPart, term) ||
        strIncludes(ex.targetMuscles ?? ex.target, term) ||
        strIncludes(ex.secondaryMuscles, term)
      );
    } else if (type === 'equipment') {
      // field is "equipments" (array) on this API
      filtered = all.filter(ex =>
        strIncludes(ex.equipments ?? ex.equipment, term)
      );
    }

    console.log(`[exercises] ${filtered.length} matches`);
    res.json({ data: filtered.slice(0, 100) });
  } catch (err) {
    console.error('[exercises] error:', err.message);
    res.json({ data: [] });
  }
});




app.get('/api/sport', async (req, res) => {
  try {
    const { input, weight, duration } = req.query;

    const url = `https://api.api-ninjas.com/v1/caloriesburned?activity=${input}&weight=${weight}&duration=${duration}`;

    const response = await fetch(url, {
      headers: { "X-Api-Key": process.env.NINJAS_API_KEY }
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Server error "});
  }
});

//Start server
app.listen(port, () => {
  console.log(`✅ Listening at http://localhost:${port}`);
});


