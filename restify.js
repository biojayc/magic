var fs = require("fs"),
    http = require('http'),
    url = require('url'),
    zlib = require('zlib'),
    log = require('./log');

var routes = [];
var filter;
var errorHandler;

function parseCookies (request) {
  var list = {},
    rc = request.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}

var Session = function(req) {
  this.sessionId = parseCookies(req)["SessionId"];
  this.cookies = parseCookies(req);
}

var handleRequest = function(req, res) {
  var session = new Session(req);
  var path = url.parse(req.url).pathname;
  log.info("Incoming Request for: " + req.method + " " + path, session.sessionId);
  log.info("User-agent: " + req.headers['user-agent'], session.sessionId);
  log.info("IPAddress: " + req.connection.remoteAddress, session.sessionId);
  var route = findRoute(path, req.method, session);
  if (filter && !route.skipFilter) {
    filter(route.handler, req, res, session);
  } else {
    route.handler(req, res, session);  
  }
}

var findRoute = function(path, method, session) {
  for (var i = 0; i < routes.length; i++) {
    if (path.match("^" + routes[i].route + "$") && 
        (method == routes[i].method || routes[i].method == "*")) {
      log.info("Route found: " + routes[i].method + " " + routes[i].route, session.sessionId);
      return routes[i];
    }
  }
  if (errorHandler) {
    log.info("No Route found, returning 404 error handler", session.sessionId);
    return { handler: errorHandler, skipFilter: true };
  }

  // If 404 and no 404 handler.
  return { handler: function(req, res) {
    log.info("No Route found, and no 404 handler.  Returning default error handler.", session.sessionId);
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end("Sorry, the page you are looking for doesn't exist.");
  }}
}

var returnError = function(req, res, session) {
  if (errorHandler) {
    errorHandler(req, res, session);
  } else {
    res.writeHead(404);
    res.end();
  }
}

var startWebServer = function(port, ip) {
  var server = http.createServer(handleRequest);
  if (ip) {
    server.listen(port, ip);
    log.info("Webserver running on " + ip + ":" + port);
  } else {
    server.listen(port);
    log.info("Webserver running on port " + port);
  }
}

var registerRoute = function(route, method, handler, skipFilter) {
  log.info("Registering Route: " + method + " " + route);
  if (route == "404") {
    errorHandler = handler;
  } else {
    routes.push({ route: route, method: method, handler: handler, skipFilter: (skipFilter ? true : false) });
  }
}

var registerFilter = function(f) {
  filter = f;
}

var registerStatic = function(path, realpath) {
  log.info("Registering static path: " + path);
  routes.push({ 
    route: path, 
    method: "GET", 
    handler: function(req, res, session) {
      var filename = req.url;
      if (realpath) {
        filename = filename.replace(path.replace(".*", ""), realpath);
      }
      
      fs.exists('.' + filename, function(exists) {
        if (exists) {
          log.info("Returning " + filename, session.sessionId);
          var raw = fs.createReadStream("." + filename);
          raw.on('error', function(err) {
            returnError(req, res, session);
          });
          var acceptEncoding = req.headers['accept-encoding'];
          if (!acceptEncoding) {
            acceptEncoding = '';
          }
          var contentType = 'text/html';
          if (filename.indexOf('.js') === filename.length - 3) {
            contentType = 'application/javascript';
          } else if (filename.indexOf('.png') === filename.length - 4) {
            contentType = 'image/png';
          } else if (filename.indexOf('.jpg') === filename.length - 4) {
            contentType = 'image/jpeg';
          } else if (filename.indexOf('.css') === filename.length - 4) {
            contentType = 'text/css';
          }
          if (acceptEncoding.match(/\bdeflat\b/)) {
            res.writeHead(200, { 'content-encoding': 'deflate', 'Content-Type': contentType, 'Cache-Control': 'max-age=120' });
            raw.pipe(zlib.createDeflate()).pipe(res);
          } else if (acceptEncoding.match(/\bgzip\b/)) {
            res.writeHead(200, { 'content-encoding' : 'gzip', 'Content-Type': contentType, 'Cache-Control': 'max-age=120' });
            raw.pipe(zlib.createGzip()).pipe(res);
          } else {
            res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'max-age=120' });
            raw.pipe(res);
          }
        } else {
          log.info(filename + ' not found.');
          returnError(req, res, session);
        }
      });
    },
    skipFilter: true,
  });
}

exports.startWebServer = startWebServer;
exports.registerRoute = registerRoute;
exports.registerStatic = registerStatic;
exports.registerFilter = registerFilter;