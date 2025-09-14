// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// static files (public folder)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// signup route - saves user as JSON line into data.txt
app.post('/signup', upload.single('image'), (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;
  const image = req.file ? req.file.filename : '';
  // simple validation
  if (!name || !username || !email || !password) return res.status(400).send('Missing fields');

  const userObj = { name, username, email, password, confirmPassword, image };
  // append as JSON line
  fs.appendFileSync(path.join(__dirname, 'data.txt'), JSON.stringify(userObj) + '\n', 'utf8');

  // redirect to login page (served from public)
  res.redirect('/login.html');
});

// login route - simple check against data.txt
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const file = path.join(__dirname, 'data.txt');
  let users = [];
  if (fs.existsSync(file)) {
    users = fs.readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch(e){ return null; }
      })
      .filter(Boolean);
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (user) return res.redirect('/home.html');
  res.send('<h3>Login failed</h3><a href="/login.html">Back to Login</a>');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    