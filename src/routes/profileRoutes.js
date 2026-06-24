const express = require('express');
const router = express.Router();
const {
  analyzeAndStoreProfile,
  getAllProfiles,
  getProfileByUsername
} = require('../controllers/profileController');

// POST /api/profiles/analyze -> fetch from GitHub, store insights in MySQL
router.post('/analyze', analyzeAndStoreProfile);

// GET /api/profiles -> list every stored/analyzed profile
router.get('/', getAllProfiles);

// GET /api/profiles/:username -> get one stored profile's data
router.get('/:username', getProfileByUsername);

module.exports = router;
