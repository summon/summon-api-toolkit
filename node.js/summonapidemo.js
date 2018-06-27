var crypto = require('crypto');
var request = require('request');
// add summon api credentials as string. TODO: replace with environment variables
var accessID;
var key;
var host = 'api.summon.serialssolutions.com';
var path = '/2.0.0/search';
var accept = 'application/json';

var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    var response = JSON.stringify(search(req.query));
    res.render('index', {response: response});
});
app.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

function search(query){
    var queryString = processQuery(query);
    var date = (new Date()).toGMTString();
    var headers = buildHeaders(accept, date, host, path, queryString, key, accessID);
    var options = {
        url: 'http://' + host + path + '?' + queryString,
        method: 'GET',
        headers: headers
      }
    console.log(options);
    
    function callback(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
    }
    
    request(options, callback);
}

function processQuery(query){
    var ordered = {};
    Object.keys(query).sort().forEach(function(key) {
        ordered[key] = query[key];
    });
    var queryString = Object.keys(ordered).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(ordered[k])
    }).join('&');
    return queryString;
}

function buildHeaders(accept, date, host, path, queryString, key, accessID){
    var idString = [accept, date, host, path, queryString, '\n'].join('\n');
    var hmac = crypto.createHmac('sha1', key);
    var hash = hmac.update(idString);
    var digest = hash.digest('base64').replace('\n','');
    var headers = {
      'Accept': accept,
      'x-summon-date': date,
      'Host': host,
      'Authorization': 'Summon ' + accessID + ';' + digest
    };
    return headers;
}
