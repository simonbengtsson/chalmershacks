var request = require('request');
var cheerio = require('cheerio');

var loginUrl = 'https://idp.chalmers.se/adfs/ls/?wa=wsignin1.0&wtrealm=urn%3achalmers%3astudent';

module.exports = {
    login: function (cid, pass) {
        if (!cid || !pass) {
            return Promise.reject("No login parameters set");
        }

        var cookieStr = '';
        return getLoginFormData().then(function (formData) {
            // Cid and pass should not be url encoded (can't use data object, has to use string)
            formData += 'ctl00$ContentPlaceHolder1$UsernameTextBox=' + cid;
            formData += '&ctl00$ContentPlaceHolder1$PasswordTextBox=' + pass;
            formData += '&ctl00%24ContentPlaceHolder1%24SubmitButton=' + 'Sign+In';
            return getLoginCookies(formData);
        }).then(function (cookies) {
            cookieStr = parseCookies(cookies);
            return getLoginFormData(cookieStr);
        }).then(function (formData) {
            return getTrustCookie(cookieStr, formData);
        }, function(error) {
            console.log('Login failed');
            console.log(error);
            return Promise.reject(error);
        });
    },
    getCurrentCourses: function (authCookies) {
        return new Promise(function (resolve, reject) {
            var options = {
                url: 'https://student.portal.chalmers.se/en/chalmersstudies/courseinformation/Pages/View%20selected%20and%20registered%20courses.aspx',
                headers: {'Cookie': authCookies}
            };
            request.post(options, function (error, response, html) {
                if (error) {
                    reject(error);
                } else {
                    var $ = cheerio.load(html);

                    var header = {};
                    $('table.evenodd th').each(function (i, elem) {
                        if (i > 0) {
                            header[i - 1] = $(elem).text().trim();
                        }
                    });

                    var rows = [];
                    $('table.evenodd tr').each(function (i, elem) {
                        if (i > 1) {
                            var row = {};
                            $('td', elem).each(function (i, elem) {
                                row[header[i]] = $(elem).html().trim().replace(/\s\s/g, "");
                            });
                            rows.push(row);
                        }
                    });

                    resolve(rows);
                }
            });
        });
    }

};

function parseCookies(raw) {
    var str = '';
    for (var i = 0; i < raw.length; i++) {
        str += raw[i].split('; ')[0] + '; ';
    }
    return str;
}

function getTrustCookie(cookieStr, formData) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: 'https://student.portal.chalmers.se/_trust/',
            form: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieStr
            }
        };
        request.post(options, function (error, response) {
            if (error) {
                reject(error);
            } else {
                var cookie = parseCookies(response.headers['set-cookie']);
                resolve(cookie + cookieStr);
            }
        });
    });
}

function getLoginCookies(formData) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: loginUrl,
            form: formData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        request.post(options, function (error, response) {
            var cookies = response.headers['set-cookie'];
            if (error) {
                reject(error);
            } else if (!cookies) {
                reject("Login failed");
            } else {
                resolve(cookies);
            }
        });
    });
}

function getLoginFormData(cookieStr) {
    cookieStr = cookieStr || '';
    return new Promise(function (resolve, reject) {
        var options = {
            url: loginUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieStr
            }
        };
        request.get(options, function (error, response, html) {
            if (error) {
                reject(error);
            } else {
                var $ = cheerio.load(html);

                var str = '';
                var formData = $('form').serializeArray();
                formData.forEach(function (pair) {
                    str += encodeURIComponent(pair.name) + '=' + encodeURIComponent(pair.value) + '&';
                });

                resolve(str);
            }
        });
    });
}