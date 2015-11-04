var express = require('express');
var app = express();
var StudentPortal = require('./app/ChalmersStudentPortal.js');
var TimeEdit = require('./app/TimeEdit.js');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/calendars/:calendar', function (req, res) {
    var cal = req.params.calendar || '';
    var credentials = new Buffer(cal, 'base64').toString();

    var cid = credentials.substr(0, credentials.indexOf('.'));
    var pass = credentials.substr(credentials.indexOf('.') + 1);

    if (cid && pass) {
        StudentPortal.login(cid, pass).then(function (cookies) {
            return StudentPortal.getCurrentCourses(cookies);
        }).then(function (courses) {
            return TimeEdit.getSchedule(courses);
        }).then(function(schedule) {
            res.json(schedule);
        }, function (error) {
            res.status(404).json(error);
        });
    }

});
app.all('*', function (req, res) {
    res.status(404).send('<h1 style="text-align:center; margin-top: 50px;">404 Not found :(</h1>');
});

app.listen('8081');
console.log('Magic happens on port 8081');