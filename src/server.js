const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDb = require('./db/initDb');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check — useful for confirming the live deployed URL works
app.get('/', (req, res) => {
  res.json({ message: 'GitHub Profile Analyzer API is running 🚀' });
});

app.use('/api/profiles', profileRoutes);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    await initDb(); // ensures DB + table exist before accepting traffic
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
