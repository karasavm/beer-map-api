var express = require('express');
var router = express.Router();

var data = require('../db/data.js')
var path = require('path');

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

router.get('/images/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/'+req.params.img));
});

router.get('/images/pins/150x150cp/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/pins/150x150cp/'+req.params.img));
});

router.get('/images/pins/compressed/:img', function(req, res, next) {
  res.sendFile(path.resolve('db/images/pins/compressed/'+req.params.img));
});


module.exports = router;
