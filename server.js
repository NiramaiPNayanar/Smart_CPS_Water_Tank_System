require('dotenv').config({ path: './mail.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- CONNECT TO MONGODB --------------------
mongoose.connect('mongodb://127.0.0.1:27017/user')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------- USER MODEL --------------------
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  mobile: String,
  appleId: String
});
const User = mongoose.model('User', userSchema);

// -------------------- WATER LEVEL MODEL --------------------
const waterSchema = new mongoose.Schema({
  water_level: Number,
  timestamp: { type: Date, default: Date.now }
});
const Water = mongoose.model('Water', waterSchema);

// -------------------- EMAIL TRANSPORTER --------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// -------------------- SIGNUP --------------------
app.post("/signup", async (req, res) => {
  const { username, password, contact } = req.body;

  try {
    const method = contact.includes('@') ? 'gmail' : (isNaN(contact) ? 'apple' : 'mobile');

    const newUser = new User({
      username,
      password, // plain text
      email: method === 'gmail' ? contact : "",
      mobile: method === 'mobile' ? contact : "",
      appleId: method === 'apple' ? contact : ""
    });

    await newUser.save();

    if (method === 'gmail') {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: contact,
        subject: "Signup Successful",
        text: `Hi ${username}, your signup was successful!`
      });
    }

    res.status(200).json({ message: "✅ Signup successful!" });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "❌ Username already exists" });
    }
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
});

// -------------------- LOGIN --------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username },
        { mobile: username },
        { appleId: username }
      ]
    });

    if (!user) return res.status(401).json({ message: "❌ Invalid credentials" });

    if (user.password !== password) {
      return res.status(401).json({ message: "❌ Invalid credentials" });
    }

    res.status(200).json({ message: "✅ Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
});

/* -------------------- Water Level Routes -------------------- */
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

// GET recent water levels
app.get('/api/waterlevel', async (req, res) => {
  try {
    const data = await Water.find().sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// -------------------- WATER ACTIVITY MODEL --------------------
const waterActivitySchema = new mongoose.Schema({
  day: String,
  data: [Number]
});
// WATER ACTIVITY MODEL
const WaterActivity = mongoose.model('WaterActivity', waterActivitySchema, 'waterlevel_activity_data');

// ROUTE
app.get('/api/waterlevel_activity_data', async (req, res) => {
  try {
    const activity = await WaterActivity.find(); // get all days
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// -------------------- CATCH-ALL ROUTE FOR HTML --------------------
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "public", `${page}.html`);
  res.sendFile(filePath, err => {
    if (err) res.status(404).send("❌ Page not found");
  });
});


// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
