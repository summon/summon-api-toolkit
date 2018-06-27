console.log('test');
var crypto = require('crypto');
var http = require('http');
var querystring = require('querystring');
var url = require('url');
var util = require('util');

//add summon api credentials as string. TODO: replace with environment variables
var accessID;
var key;

var host = 'api.summon.serialssolutions.com';


http.createServer(function (request, response) {
  util.log(request.method + ' http://' + request.headers.host + request.url);
  var urlParts = url.parse(request.url);
  var accept = 'application/json';
  var date = (new Date()).toGMTString();
  var path = '/2.0.0/search';
  //TODO: Retrieve form parameters for query
  var query = 's.q=test';

  //TODO: Separate sections below into functions

  var unQuery;
  if (urlParts.query) {
    var queryParts = urlParts.query.split('&');
    var params = [];
    for (var i = 0; i < queryParts.length; i++) {
      var param = queryParts[i];
      if (param && (param.indexOf('=') != -1)) {
        param = param.replace('+', '%20');
        params.push(param);
      }
    }
    params.sort();
    query = params.join('&');
    unQuery = querystring.unescape(query);
  } else {
    query = unQuery = '';
  }

  var idString = accept + '\n' + date + '\n' + host + '\n' + path + '\n' + unQuery + '\n';
  var hmac = crypto.createHmac('sha1', key);
  var hash = hmac.update(idString);
  var digest = hash.digest('base64');
  var headers = {
    accept: accept,
    'x-summon-date': date,
    'Host': host,
    'Authorization': 'Summon ' + accessID + ';' + digest
  };


  var options = {
    hostname: host,
    port: 80,
    path: path,
    method: 'GET',
    headers: headers
  }
  var summonRequest = http.request(options);
  summonRequest.end();
  summonRequest.on('response', function(summonResponse) {
    if (summonResponse.statusCode !== 200) {
      response.writeHead(summonResponse.statusCode, 
          {'Content-Type': 'text/html'});
    } else {
      response.writeHead(200, {'Content-Type': 'application/json'});
    }
    summonResponse.setEncoding('utf8');
    summonResponse.on('data', function(chunk) {
      response.write(chunk);
    });
    summonResponse.on('end', function() {
      response.end();
    });
  });
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');