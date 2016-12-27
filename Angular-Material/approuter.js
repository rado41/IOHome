var express = require('express');
var dbController = require('./Server/Controllers/db-controller.js')
var router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(__dirname + '/Client/index.html');
});

router.get('/home', dbController.getAll);

module.exports = router;
