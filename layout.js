var fs = require("fs"),
    readline = require('readline'),
    url = require('url'), 
    CacheManager = require('./cache').CacheManager,
    log = require('./log');

var cache = new CacheManager();

function readFile(file, callback) {
  if (cache.get(file)) {
    if (cache.get(file)) {
      callback(cache.get(file));
    } else {
      callback('');
    }
  } else {
    cache.add(file, function(cb) {
      log.info("Loading " + file + " into cache.");
      fs.readFile(file, "utf8", function(err, body) {
        cb(body, function() { callback(body); });
      });
    });
  }
}

var getLayoutText = function(callback, bodyFile, layoutFile) {
  readFile(bodyFile, function(body) {
    if (layoutFile && layoutFile != "") {
      var layout = readFile(layoutFile, function(layout) {
        callback(layout.replace("##BODYTEXT##", body));
      });
    } else {
      callback(body);
    }
  });
}

var substituteVars = function(html, vars) {
  var re = /##(\w+)##/;
  var done = false;
  while (!done) {
    var match = html.match(re);
    if (match) {
      var key = match[1];
      if (vars[key] || vars[key] === 0) {
        html = html.replace("##" + key + '##', vars[key]);
      } else {
        html = html.replace("##" + key + '##', '');
      }
    } else  {
      done = true;
    }
  }
  return html;
}

var getRepeatedRegions = function(html) {
  var startRegex = /##(\w+)-begin##/;
  var result = [];
  var done = false;
  
  while (!done) {
    var match = html.match(startRegex);
    if (match) {
      var regionName = match[1];
      html = html.substr(html.search(startRegex) + regionName.length + 10, html.length);
      var endRegex = "##" + regionName + "-end##";
      var innerHTML = html.substr(0, html.search(endRegex));
      html = html.substr(html.search(endRegex), html.length);
      if (regionName && innerHTML) {
        result.push({ name: regionName, html: innerHTML });
      }
    } else {
      done = true;
    }
  }
  return result;
}

var processRepeatedRegions = function(html, vars) {
  var repeatedRegions = getRepeatedRegions(html);
  var newHTML;
  for(var i=0; i < repeatedRegions.length; i++) {
    var region = repeatedRegions[i];
    newHTML = "";
    var regionName = region.name;
    var regionHTML = region.html;
    var arr = vars[regionName] || [];
    for (var j=0;j < arr.length; j++) {
      var obj = arr[j];
      var tempHTML = processRepeatedRegions(regionHTML, obj);
      newHTML += substituteVars(tempHTML, obj);
    }
    var start = html.indexOf('##' + regionName + '-begin##');
    var end = html.indexOf('##' + regionName + '-end##') + 8 + regionName.length;
    var subhtml = html.substr(start, end-start);
    html = html.replace(subhtml, newHTML);
  }
  return html;
}

var getConditionalRegions = function(html) {
  var startRegex = /##IF (\w+)##/;
  var result = [];
  var done = false;
  while (!done) {
    var match = html.match(startRegex);
    if (match) {
      var regionName = match[1];
      html = html.substr(html.search(startRegex) + regionName.length + 7, html.length);
      var endRegex = "##ENDIF " + regionName + "##";
      var innerHTML = html.substr(0, html.search(endRegex));
      html = html.substr(html.search(endRegex), html.length);
      if (regionName && innerHTML) {
        result.push({ name: regionName, html: innerHTML });
      }
    } else {
      done = true;
    }
  }
  return result;
}

var processConditionalRegions = function(html, vars) {
  var conditionalRegions = getConditionalRegions(html);
  for (var i = 0; i < conditionalRegions.length; i++) {
    var region = conditionalRegions[i];

    // Have to go ahead and process internal conditionals
    var tempHTML = processConditionalRegions(region.html, vars);
    var start = html.indexOf('##IF ' + region.name + '##');
    var end = html.indexOf('##ENDIF ' + region.name + "##") + 11 + region.name.length;
    var subhtml = html.substr(start, end-start);
    var mid = tempHTML.indexOf('##ELSE##');
    var ifhtml = "";
    var elsehtml = "";
    if (mid > 0) {
      ifhtml = tempHTML.substr(0, mid);
      elsehtml = tempHTML.substr(mid+8, tempHTML.length - (mid+8));
    } else {
      ifhtml = tempHTML;
    }
    /*tempHTML = processRepeatedRegions(tempHTML, vars);
    tempHTML += substituteVars(tempHTML, vars);*/
    var expression = vars[region.name] || false;
    if (expression) {
      html = html.replace(subhtml, ifhtml);
    } else  {
      html = html.replace(subhtml, elsehtml);
    }
  }

  return html;
}

var LayoutEngine = function(bodyFile, layoutFile, vars) {
  this.bodyFile = bodyFile;
  this.layoutFile = layoutFile;
  this.vars = vars;
}
LayoutEngine.prototype.render = function(callback) {
  var vars = this.vars;
  var html = getLayoutText(
    function(html) {
      html = processConditionalRegions(html, vars);
      html = processRepeatedRegions(html, vars);
      html = substituteVars(html, vars);
      if (callback) {
        callback(html);
      }
    }, this.bodyFile, this.layoutFile);
}
LayoutEngine.prototype.renderResponse = function(res) {
  this.render(function(html) {this.defaultRenderMethod(res, html)}.bind(this));
}
LayoutEngine.prototype.defaultRenderMethod = function(res, html) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
}
var create = function(bodyFile, layoutFile, vars) {
  return new LayoutEngine(bodyFile, layoutFile, vars);
}

// This method allows you to override the defaultRenderMethod above 
// with one that does something else if you prefer.
var registerDefaultRenderMethod = function(funct) {
  LayoutEngine.prototype.defaultRenderMethod = funct;
}

exports.create = create;
exports.registerDefaultRenderMethod = registerDefaultRenderMethod;