/**
 * Original source for a TimeEdit module that scrambles urls
 * @Note Converted to node.js from browser javascript
 */
var TEScrambler = (function () {
    var my = {};

    var tabledata = [
        ['h=t&sid=', '6='],
        ['objects=', '1='],
        ['sid=', '2='],
        ['&ox=0&types=0&fe=0', '3=3'],
        ['&types=0&fe=0', '5=5'],
        ['&h=t&p=', '4=']
    ];
    var tabledataspecial = [
        ['=', 'ZZZX1'],
        ['&', 'ZZZX2'],
        [',', 'ZZZX3'],
        ['.', 'ZZZX4'],
        [' ', 'ZZZX5'],
        ['-', 'ZZZX6'],
        ['/', 'ZZZX7'],
        ['%', 'ZZZX8']
    ];
    var pairs = [
        ['=', 'Q'],
        ['&', 'Z'],
        [',', 'X'],
        ['.', 'Y'],
        [' ', 'V'],
        ['-', 'W']
    ];
    var pattern = [4, 22, 5, 37, 26, 17, 33, 15, 39, 11, 45, 20, 2, 40, 19, 36, 28, 38, 30, 41, 44, 42, 7, 24, 14, 27, 35, 25, 12, 1, 43, 23, 6, 16, 3, 9, 47, 46, 48, 50, 21, 10, 49, 32, 18, 31, 29, 34, 13, 8];


    function tablespecial(result) {
        for (var i = 0; i < 100; i++) {
            for (var index = 0; index < tabledataspecial.length; index++) {
                var key = tabledataspecial[index];
                result = result.replace(key[0], key[1]);
            }
        }
        return result;
    }

    function tableshort(result) {
        for (var index = 0; index < tabledata.length; index++) {
            var key = tabledata[index];
            result = result.replace(key[0], key[1]);
        }
        return result;
    }


    function modKey(ch) {
        if (ch >= 97 && ch <= 122) {
            return ( 97 + (ch - 88) % 26);
        }
        if (ch >= 49 && ch <= 57) {
            return ( 49 + (ch - 45) % 9);
        }
        return ch;
    }


    function scrambleChar(ch) {
        for (var index = 0; index < pairs.length; index++) {
            var pair = pairs[index];
            if (ch === pair[0]) {
                return pair[1];
            }
            if (ch === pair[1]) {
                return pair[0];
            }
        }
        return String.fromCharCode(modKey(ch.charCodeAt(0)));
    }


    function swap(result, from, to) {
        if ((from < 0) || (from >= result.length)) {
            return;
        }
        if ((to < 0) || (to >= result.length)) {
            return;
        }
        var fromChar = result[from];
        result[from] = result[to];
        result[to] = fromChar;
    }


    function swapPattern(result) {
        var steps = Math.ceil(result.length, pattern.length);
        for (var step = 0; step < steps; step++) {
            for (var index = 1; index < pattern.length; index += 2) {
                swap(result, pattern[index] + step * pattern.length, pattern[index - 1] + step * pattern.length);
            }
        }
    }


    function swapChar(result) {
        var split = result.split('');
        for (index = 0; index < split.length; index++) {
            split[index] = scrambleChar(split[index]);
        }
        swapPattern(split);
        return split.join('');
    }


    function scramble(query) {
        if (isEmpty(query)) {
            return query;
        }
        if (query.length < 2) {
            return query;
        }
        if (query.substring(0, 2) === 'i=') {
            return query;
        }
        var result = decodeURIComponent(query);
        result = tableshort(result);
        result = swapChar(result);
        result = tablespecial(result);
        return encodeURIComponent(result);
    }

    my.asURL = function (urls, keyValues, extra) {
        var url = urls[0];
        for (var index = 0; index < keyValues.length; index++) {
            keyValues[index] = toString(keyValues[index]).replace(/[+]/g, " ");
        }
        var lastSlash = toString(url).lastIndexOf('/');
        var page = url.substring(lastSlash + 1, url.length);
        if (page.indexOf('r') !== 0) {
            return url + '?i=' + scramble(keyValues.join('&') + toString(extra));
        }
        var dot = '.html';
        var lastDot = toString(url).lastIndexOf('.');
        if (lastDot != -1) {
            dot = url.substring(lastDot, url.length);
        }
        if (lastSlash != -1) {
            url = url.substring(0, lastSlash + 1);
        }
        return url + 'ri' + scramble(keyValues.join('&') + toString(extra)) + dot;
    };
    return my;
}());

// Helper methods that TimeEdit uses
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function toString(string) {
    if (isEmpty(string)) {
        return '';
    }
    return '' + string;
}

// Export function that has default values for all options but objects
module.exports = {
    objectToUrl: function (objectIds, urls, keyValues) {
        urls = urls || ["https://se.timeedit.net/web/chalmers/db1/public/ri.ics"];

        // 1th of jan +- two years should be good enough
        var currentYear = new Date().getFullYear();
        var start = (currentYear - 2) + '0101';
        var end = (currentYear + 2) + '0101';

        keyValues = keyValues || ["h=t", "sid=3", "p=" + start + '%2C' + end, "ox=0", "types=0", "fe=0"];

        var objects = 'objects=' + objectIds.join();
        keyValues.push(objects);

        return TEScrambler.asURL(urls, keyValues);
    }
};