require('dotenv').config({ path: './mail.env' });
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  contact: String
});
const User = mongoose.model("User", UserSchema);

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password, contact } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, contact });
    await newUser.save();

    // send email if contact contains "@"
    if(contact.includes('@')) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: contact,
        subject: "Signup Successful",
        text: `Hi ${username}, your signup was successful!`
      });
    }

    res.status(200).json({ message: "✅ Signup successful!" });
  } catch(err) {
    console.error(err);
    if(err.code === 11000){
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
    if(!user) return res.status(401).json({ message: "❌ Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({ message: "❌ Invalid credentials" });

    res.status(200).json({ message: "✅ Login successful!" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
