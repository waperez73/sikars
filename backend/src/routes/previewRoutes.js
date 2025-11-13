const express = require('express');
const router = express.Router();

router.post('/render-preview', async (req, res) => {
  res.json({ 
    status: 'success',
    url: 'https://via.placeholder.com/400x300?text=Preview+Coming+Soon'
  });
});

module.exports = router;
