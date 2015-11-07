var fs = require('fs');
var crypto = require('crypto');
var env = require('../env.json');
var database = './calendars.json';

/**
 * Handles persistence of credentials and calendar settings
 */
module.exports = {
    store: function (user, password) {
        var cals = readFile();
        var hash = encrypt(user);
        cals[hash] = {username: user, password: encrypt(password)};
        writeFile(cals);
        return hash;
    },
    load: function (hash) {
        var data = readFile()[hash];
        if (data) {
            data.password = decrypt(data.password);
        }
        return data || null;
    }
};

function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-ctr', env.secret);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-ctr', env.secret);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

function readFile() {
    var data = '{}';
    try {
        data = fs.readFileSync(database);
    } catch(e) {}
    data = JSON.parse(data);
    return data;
}

function writeFile(data) {
    var str = JSON.stringify(data, null, 4);
    fs.writeFileSync(database, str);
}