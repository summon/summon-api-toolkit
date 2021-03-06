require('dotenv').config();
var crypto = require('crypto');
var request = require('request');
var url = require('url');

//create .env file with ACCESS_ID and API_KEY
var accessID = process.env.ACCESS_ID;
var key = process.env.API_KEY;
var host = 'api.summon.serialssolutions.com';
var path = '/2.0.0/search';
var accept = 'application/json'; //application/xml also accepted but template would need to be reworked to parse it

var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    if (Object.keys(req.query).length === 0){
        res.render('index', {error: {}, response: ''});
    }
    else{
        var query = searchQuery(req.url);
        request(query, function(err, response, body){
            var jsonResponse;
            var error = {};

            // catch errors that don't result in a valid JSON response
            try {
                jsonResponse = JSON.parse(body);
            }
            catch(SyntaxError) {
                console.error(response.statusCode, response.statusMessage);
            }

            if (response.statusCode !== 200) {
                error = {
                    status: response.statusCode,
                    message: jsonResponse ? jsonResponse.errors[0].message : response.statusMessage
                }
                res.render('index', {error: error, response: '{}'});
                return;
            }

            // renders template after JSON response is returned
            res.render('index', {error: error, response: body});
        });
    }
});
app.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

function searchQuery(requestUrl){
    //generates the necessary request options (headers, etc.) for HTTP request
    var queryString = processQuery(requestUrl);
    console.log ('queryString = ' + queryString);
    var date = (new Date()).toGMTString();
    var headers = buildHeaders(accept, date, host, path, queryString, key, accessID);
    var options = {
        url: 'http://' + host + path + '?' + queryString,
        mode: 'GET',
        headers: headers
    }
    return options;
}

function processQuery(requestUrl){
    //sorts and decodes URL paramters
    //TODO: More comprehensive replacement, library?
    var query = requestUrl.slice(2).replace(/\+/g,'%20').replace(/\%20\&/,'&');
    var splitQuery = query.split('&');
    var sortQuery = splitQuery.sort();
    var joinQuery = sortQuery.join('&');
    return decodeURIComponent(joinQuery);
}

function buildHeaders(accept, date, host, path, queryString, key, accessID){
    //creates headers for search request, including authentication digest
    var idString = [accept, date, host, path, queryString].join('\n') + '\n';
    var hmac = crypto.createHmac('sha1', key);
    var hash = hmac.update(idString);
    var digest = hash.digest('base64');
    var headers = {
      'Accept': accept,
      'x-summon-date': date,
      'Host': host,
      'Authorization': 'Summon ' + accessID + ';' + digest
    };
    return headers;
}

//TODO: Create test for digest
// var idString = "application/xml" + "\n" + "Tue, 30 Jun 2009 12:10:24 GMT" + "\n" + "api.summon.serialssolutions.com" + "\n" + "/2.0.0/search" + "\n" + "ff=ContentType,or,1,15" + "&" + "q=forest" + "\n"
// var hmac = crypto.createHmac('sha1', 'ed2ee2e0-65c1-11de-8a39-0800200c9a66');
// var hash = hmac.update(idString);
// var digest = hash.digest('base64').replace('\n','');
// console.log(digest);
//expected result: kBu2GLX7Nf/HEG9+71MHIljEnuU=
