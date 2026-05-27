require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const FAQ = require('./models/FAQ');
const authRoutes = require('./routes/auth');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find().lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/faqs/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) {
      const faqs = await FAQ.find().lean();
      return res.json(faqs);
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const faqs = await FAQ.find({
      $or: [
        { 'questions.q': { $regex: regex } },
        { 'questions.a': { $regex: regex } },
      ],
    }).lean();

    const results = faqs.map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        item => regex.test(item.q) || regex.test(item.a)
      ),
    })).filter(cat => cat.questions.length > 0);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', auth, async (req, res) => {
  try {
    const totalFaqs = await FAQ.aggregate([
      { $unwind: '$questions' },
      { $count: 'total' },
    ]);
    const categories = await FAQ.countDocuments();
    res.json({
      user: req.user,
      stats: {
        categories,
        questions: totalFaqs[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`FAQ API server running on http://localhost:${PORT}`);
});
