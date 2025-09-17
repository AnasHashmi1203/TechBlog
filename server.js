// server.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- MongoDB Connection -----------------
mongoose.connect("mongodb+srv://anashashmi1203_db_user:A%28nas%292010H17%40%40%40@1stdata.utw6y5z.mongodb.net/?retryWrites=true&w=majority&appName=1stdata", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected successfully");
}).catch(err => {
  console.error("❌ MongoDB connection failed:", err);
});

// ----------------- Mongoose Schema -----------------
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  confirmPassword: String,
  image: String
});

const User = mongoose.model("User", userSchema);

// ----------------- Multer Setup (Uploads) -----------------
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: multerStorage });

// ----------------- Routes -----------------

// Signup Route
app.post('/signup', upload.single('image'), async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;
  const image = req.file ? req.file.filename : '';

  if (!name || !username || !email || !password) {
    return res.status(400).send('❌ Missing fields');
  }

  try {
    const newUser = new User({ name, username, email, password, confirmPassword, image });
    await newUser.save();
    console.log("✅ New user saved:", newUser);
    res.redirect('/login.html');
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error saving user");
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      console.log("✅ User logged in:", user.username);
      return res.redirect('/home.html');
    }
    res.send('<h3>❌ Login failed</h3><a href="/login.html">Back to Login</a>');
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error during login");
  }
});

// ----------------- Server Start -----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
