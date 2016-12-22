var IOhome = require('../Models/iohome');

module.exports.addRoom = function (req, res) {
}

module.exports.editRoom = function (req, res) {
}

module.exports.addPort = function (req, res) {
}

module.exports.editPort = function (req, res) {
}

module.exports.addSchedule = function (req, res) {
}

module.exports.editSchedule = function (req, res) {
}

module.exports.getAll = function (req, res) {
  IOhome.find({}, {_id: 0}, function (err, results) {
    res.json(results);
  });
}
