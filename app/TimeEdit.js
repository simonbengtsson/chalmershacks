var request = require('request');
var TEScramble = require('./TimeEditScrambler.js');

module.exports = {
    getSchedule: function (courses) {
        var proms = [];
        for (var i = 0; i < courses.length; i++) {
            var code = courses[i]['Course'];
            proms.push(getTimeEditObjectId(code));
        }
        return Promise.all(proms).then(function (objectIds) {
            var schedule = TEScramble.objectToUrl(objectIds);
            return Promise.resolve(schedule);
        });
    }
};

function getTimeEditObjectId(code) {
    var searchUrl = 'https://se.timeedit.net/web/chalmers/db1/public/objects.json?sid=3&types=182&search_text=';
    return new Promise(function (resolve, reject) {
        request.get(searchUrl + code, function (error, response, json) {
            if (error) {
                reject(error);
            } else {
                var record = JSON.parse(json).records[0];
                resolve(record.idAndType);
            }
        });
    });
}