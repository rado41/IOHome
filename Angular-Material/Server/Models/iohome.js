var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scheduleSchama = new Schema({
  time: Date,
  schedevent: Object,
});

var portSchema = new Schema({
  name: String,
  id: Number,
  description: String,
  // schedules = [scheduleSchema],
});

var roomSchema = new Schema({
  name:  String,
  id: Number,
  ports: [portSchema],
});

var homeSchema = new Schema({
  name: String,
  rooms : [roomSchema],
});

var iohome = mongoose.model('iohome', homeSchema,"iohome");

module.exports = iohome;
// var rooms = mongoose.model('room', roomSchema);
// var ports = mongoose.model('port', portSchema);
// var schedules = mongoose.model('schedule',scheduleSchama);
