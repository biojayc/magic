var fs = require('fs');

var getDateString = function() {
  var newDate = new Date();
  
  var dd = newDate.getDate();
  var MM = newDate.getMonth()+1; //January is 0!
  var yyyy = newDate.getFullYear();
  var hh = newDate.getHours();
  var mm = newDate.getMinutes();
  var ss = newDate.getSeconds();
  var ms = newDate.getMilliseconds();

  if(dd<10) {
    dd='0'+dd
  } 

  if(MM<10) {
    MM='0'+MM
  } 

  return MM+'/'+dd+'/'+yyyy + ":" + hh + ":" + mm + ":" + ss + ":" + ms;
}

var getLogName = function() {
  var newDate = new Date();
  
  var dd = newDate.getDate();
  var MM = newDate.getMonth()+1; //January is 0!
  var yyyy = newDate.getFullYear();
  var hh = newDate.getHours();
  var mm = newDate.getMinutes();
  var ss = newDate.getSeconds();
  var ms = newDate.getMilliseconds();

  if(dd<10) {
    dd='0'+dd
  } 

  if(MM<10) {
    MM='0'+MM
  } 

  return yyyy + '' + MM + '' + dd + '' + hh + '' + mm + '' + ss + '' + ms;
}

var state = {
  log: '',
};

var init = function() {
  state.filename = getLogName();
  state.log = '';
  // fs.appendFile(""filename)
  setInterval(function() {
    if (state.log) {
      fs.appendFile('logs/' + state.filename, state.log, 'utf8', function(err) {
        if (err) {
          console.log('There was an error writing to the log file: ' + err);
        }
      });
      state.log = '';
    }
  }, 30 * 60 * 1000);  // 30 minutes
}

var log = function(type, msg, sessionId) {
  var time = getDateString();

  var prefix = type + " " + time;
  if(sessionId) {
    prefix += " (" + sessionId + ")";
  }
  state.log += prefix + ": " + msg + "\n";
  console.log(prefix + ": " + msg);
}

var info = function(msg, sessionId) {
  log("I", msg, sessionId);
}

var error = function(msg, sessionId) {
  log("E", msg, sessionId);
}

exports.init = init;
exports.info = info;
exports.error = error;