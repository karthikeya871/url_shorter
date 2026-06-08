// ==========================================
// 1. IMPORTS & CONFIGURATION (Always first!)
// ==========================================
const express = require('express');
const { nanoid } = require('nanoid');
const Url = require('./db'); // Moved from the bottom to the top

const app = express();

// ==========================================
// 2. MIDDLEWARE (Must sit BEFORE your routes)
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// ==========================================
// 3. ROUTES (Sits in the middle)
// ==========================================
app.get('/', (req, res) => {
    res.send('Phase 1 complete! Your server is alive.');
});

// --- API Endpoint: Shorten a URL ---
app.post('/api/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Please provide a valid URL' });
  }

  try {
    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.json({ shortUrl: `http://localhost:5000/${url.shortCode}` });
    }

    const shortCode = nanoid(6);
    url = new Url({ longUrl, shortCode });
    await url.save();

    res.json({ shortUrl: `http://localhost:5000/${shortCode}` });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server database error' });
  }
});
// --- Redirect Route: Accessing the short URL ---
// The ':code' is a dynamic parameter. Express will grab whatever is written after the '/'
app.get('/:code', async (req, res) => {
  try {
    // Task 4.2: Extract the unique code from the browser's address bar URL
    const { code } = req.params;

    // Task 4.3: Search MongoDB to see if we have a matching shortCode
    const url = await Url.findOne({ shortCode: code });

    if (url) {
      // Task 4.4: If found, perform an HTTP Redirect to the original long URL!
      return res.redirect(url.longUrl);
    } else {
      // Task 4.5: If the code isn't in our database, return a clean 404 error
      return res.status(404).send('<h1>URL Not Found</h1><p>The short link you followed does not exist.</p>');
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error processing your redirect');
  }
});
// ==========================================
// 4. START SERVER (Always at the very bottom)
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`);
});