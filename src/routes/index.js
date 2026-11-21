const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const candidateRoutes = require('./candidateRoutes');
const leadRoutes = require('./leadRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    service: 'GDGoC VJIT Recruitment API'
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/leads', leadRoutes);

module.exports = router;
