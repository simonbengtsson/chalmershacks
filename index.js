var express = require('express');
var app = express();
var StudentPortal = require('./app/ChalmersStudentPortal.js');
var TimeEdit = require('./app/TimeEdit.js');
var Storage = require('./app/Storage.js');

app.get('/schedule/obtain', function (req, res) {
    var cid = req.query.user;
    var passBase64 = req.query.password;
    var pass = new Buffer(passBase64, 'base64').toString();

    var registeredCourses;
    StudentPortal.login(cid, pass).then(function (cookies) {
        return StudentPortal.getCurrentCourses(cookies);
    }).then(function (courses) {
        registeredCourses = courses;
        return TimeEdit.getSchedule(courses, 'json');
    }).then(function(schedule) {
        schedule = JSON.parse(schedule);
        // Everything seems to be in order and therefore saving the credentials
        var hash = Storage.store(cid, pass);
        var cal = '/schedule/' + hash;
        res.json({data: schedule.reservations, link: cal, courses: registeredCourses});
    }, function (error) {
        res.status(400).json({message: error});
    });
});

app.get('/schedule/:hash/:filename*?', function (req, res) {
    var hash = req.params.hash || '';
    var credentials = Storage.load(hash);

    StudentPortal.login(credentials.username, credentials.password).then(function (cookies) {
        return StudentPortal.getCurrentCourses(cookies);
    }).then(function (courses) {
        return TimeEdit.getSchedule(courses);
    }).then(function(schedule) {
        schedule = schedule.replace('X-WR-CALNAME:TimeEdit-Chalmers', 'X-WR-CALNAME:Chalmers');
        res.set('Content-Type', 'text/calendar; charset=utf-8');
        res.set('Content-Disposition', 'inline; filename=schedule.ics');
        res.send(schedule);
    }, function (error) {
        res.status(400).json({message: error});
    });
});

app.use(express.static('./public'));

app.use(function(req, res) {
    res.status(404).send('<h1 style="text-align:center; margin-top: 50px;">404 Not found :(</h1>');
});

app.listen('8081');