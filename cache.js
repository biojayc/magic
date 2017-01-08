// CacheManager is used for caching objects.
// It's proactive, meaning it recaches after the timeout automatically without
// waiting for a get.
// Just new one, then use .add with a key, a calculation function,
// and optionally a number of milliseconds of how long to cache.
// 
// sample usage:
// var cache = new CacheManager();
// var value = cache.add('mykey', function(callback) {
//   ... some calculation
//   callback(value);
// }, 3600000);  // cache for an hour.
// ...
// var value = cache.get('mykey');  // stays up to date.
// 

var isFunction = function(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var CacheManager = function() {
  this.cache = {};
}
// If key already exists, it overwrites it with new callback, seconds.
// func should accept a callback argument that is fired when it's complete, passing in the value.
CacheManager.prototype.add = function(key, func, millis) {
  if (!key || !func) {
    throw err;  // find out what this does.
  }
  if (this[key]) {
    this.remove(key);
  }
  var cache = this.cache;
  this.cache[key] = {};
  var calculate = function() {
    func(function(value, callback) {
      if (typeof(cache[key]) === 'undefined') {
        cache[key] = {};
      }
      cache[key].value = value;
      if (callback) {
        callback();
      }
    });
  };
  calculate();
  if (millis) {
    var intervalHandle = setInterval(calculate, millis);
    cache[key] = { intervalHandle: intervalHandle };
  }
  
}
CacheManager.prototype.get = function(key) {
  if (!key) {
    return undefined;
  }
  
  if (this.cache[key] && this.cache[key].value) {
    return this.cache[key].value;
  }
  
  return undefined;
}
CacheManager.prototype.remove = function(key) {
  if (this.cache[key]) {
    var obj = this.cache[key];
    if (obj.intervalHandle) {
      clearInterval(obj.intervalHandle);
    }
  }
  this.cache[key] = undefined;
}

exports.CacheManager = CacheManager;


//test code
var test = function() {
  var i = 1;
  var func = function(callback) {
    console.log("returning i: " + i);
    callback(i++);
  }
  var cache = new CacheManager();
  cache.add('i', func, 1000);
  var interval = setInterval(function() {
    console.log("Getting i: " + cache.get('i'));
  }, 3000);
  setTimeout(function() {
    console.log('clear timeout fired.');
    clearInterval(interval);
    cache.remove('i');
  }, 10000);
}
// test();