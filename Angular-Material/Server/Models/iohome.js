var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scheduleSchema = new Schema({
  time: Date,
  schedevent: Object,
});

var portSchema = new Schema({
  name: String,
  anchorPort: Number,
  status: Boolean,
  pId: Number,
  description: String,
  schedules: [scheduleSchema],
});

var roomSchema = new Schema({
  name:  String,
  ports: [portSchema],
  rId: Number,
});

var homeSchema = new Schema({
  rooms : [roomSchema],
});

var globalSchema = new Schema({
  globals: [{name: String, value: String}],
});

var nodeSchema = new Schema({
  rId: Number,
});

var iohome = {};
iohome.home      = mongoose.model('iohome', homeSchema,"iohome");
iohome.rooms     = mongoose.model('room', roomSchema,"rooms");
iohome.ports     = mongoose.model('port', portSchema,"ports");
iohome.schedules = mongoose.model('schedule',scheduleSchema,"schedules");
iohome.globals   = mongoose.model('global',globalSchema,"globals");
iohome.nodes     = mongoose.model('node',nodeSchema,"nodes");

module.exports = iohome;
