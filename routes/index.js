var express = require('express');
var router = express.Router();
var data = require('./data.js')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Express' });
});

router.get('/brews', function(req, res, next) {
  res.json(data.rawData);
});

router.get('/areas', function(req, res, next) {
  res.json(data.areasData);
});

router.get('/spots', function(req, res, next) {
  res.json(data.spotsData);
});


module.exports = router;
