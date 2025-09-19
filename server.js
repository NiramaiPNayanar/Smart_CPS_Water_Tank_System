const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // for parsing JSON POST bodies

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/waterdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schema & model
const waterSchema = new mongoose.Schema({
  water_level: Number,
  timestamp: { type: Date, default: Date.now }
});
const Water = mongoose.model('Water', waterSchema);

// POST route to save water level
app.post('/api/waterlevel', async (req, res) => {
  try {
    const { water_level } = req.body;
    if (typeof water_level !== 'number') return res.status(400).send('Invalid data');

    const entry = new Water({ water_level });
    await entry.save();
    res.status(200).send('Saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Optional: GET route to test
app.get('/api/waterlevel', async (req, res) => {
  const data = await Water.find().sort({ timestamp: -1 }).limit(20);
  res.json(data);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
