const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User');
const Project = require('./models/Project');
const multer = require('multer');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use('/assets', express.static('assets'));

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/srm-login-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password', // Use environment variables for security
  },
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  // Email validation
  if (!email.endsWith('@srmist.edu.in')) {
    return res.status(400).json({ message: 'Access denied, try with your provided uni email.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create new user
    user = new User({ email, password });
    await user.save();
    res.status(200).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists and password matches
    let user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({ message: 'Login successful.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Forgot Password Route
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Generate a token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetURL = `http://localhost:5000/resetPassword.html?token=${resetToken}`;
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password: \n\n ${resetURL}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ message: 'Error sending email.' });
      } else {
        res.status(200).json({ message: 'Password reset email sent.' });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Reset Password Route
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with matching reset token
    let user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Post Project Route
app.post('/api/projects', upload.single('thumbnail'), async (req, res) => {
  const { title, description, githubLink, userId } = req.body;
  const thumbnail = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const project = new Project({
      title,
      description,
      githubLink,
      thumbnail,
      user: userId
    });
    await project.save();
    res.status(200).json({ message: 'Project uploaded successfully.' });
  } catch (err) {
    console.error('Error saving project:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Get Projects Route
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('user', 'email');
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
