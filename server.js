// Load env variables
require('dotenv').config({ path: './mail.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // built-in JSON parser
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/waterdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

/* -------------------- User Schema -------------------- */
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  contact: String
});
const User = mongoose.model("User", UserSchema);

/* -------------------- Water Schema -------------------- */
const waterSchema = new mongoose.Schema({
  water_level: Number,
  timestamp: { type: Date, default: Date.now }
});
const Water = mongoose.model('Water', waterSchema);

/* -------------------- Email Transporter -------------------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* -------------------- Auth Routes -------------------- */
// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password, contact } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, contact });
    await newUser.save();

    // send email if contact is an email
    if (contact && contact.includes('@')) {
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

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "❌ Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "❌ Invalid credentials" });

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
  const data = await Water.find().sort({ timestamp: -1 }).limit(20);
  res.json(data);
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
