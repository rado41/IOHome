var express           = require('express'),
    app               = express(),
    bodyParser        = require('body-parser'),
    mongoose          = require('mongoose'),
    approuter         = require('./approuter')

app.use('/Client', express.static(__dirname + '/Client'));
app.use('/Server', express.static(__dirname + '/Server'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

mongoose.connect("mongodb://localhost/iohome");
//All routing are done in this file
app.use(approuter);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
