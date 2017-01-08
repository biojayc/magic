var url = url = require('url'),
    qs = require( "querystring" );

var getQueryObj = function(req) {
  var url_parts = url.parse(req.url, true);
  return url_parts.query;
}

var getPostObj = function(req, callback) {
  if (req.headers['content-type'] == 'application/json') {
    var body = "";
    var obj;
    req.on('data', function(data) {
      body += data;
    });
    
    req.on('end', function () {
      obj = JSON.parse(body);
      callback(obj);
    });
  } else {
    var body = "";
    var obj;
    req.on('data', function(data) {
      body += data;
    });
    
    req.on('end', function () {
      obj = qs.parse(body);
      callback(obj);
    });
  }
}

exports.getQueryObj = getQueryObj;
exports.getPostObj = getPostObj;