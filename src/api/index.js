const express = require('express');
const routes = require('./routes/index');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Reactflix API - ๐๐๐๐',
    author: 'Carlos Fernรกndez',
  });
});

router.use('/', routes);

module.exports = router;