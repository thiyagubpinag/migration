// Legacy utility functions with old patterns

var _ = require('lodash');
var Q = require('q');

// Using var and old function syntax
var Utils = function() {
  this.name = 'Utils';
};

// Prototype-based inheritance (legacy pattern)
Utils.prototype.formatDate = function(date) {
  var d = new Date(date);
  var month = '' + (d.getMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Using Q promises (deprecated library)
Utils.prototype.delayedOperation = function(value, delay) {
  var deferred = Q.defer();
  
  setTimeout(function() {
    deferred.resolve(value);
  }, delay);
  
  return deferred.promise;
};

// Legacy array manipulation
Utils.prototype.filterActiveItems = function(items) {
  var result = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].active) {
      result.push(items[i]);
    }
  }
  return result;
};

// Old-style object property access
Utils.prototype.getNestedProperty = function(obj, path) {
  var keys = path.split('.');
  var result = obj;
  
  for (var i = 0; i < keys.length; i++) {
    if (result && result.hasOwnProperty(keys[i])) {
      result = result[keys[i]];
    } else {
      return undefined;
    }
  }
  
  return result;
};

// Using arguments object (legacy)
Utils.prototype.sum = function() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
};

// Legacy error handling with callbacks
Utils.prototype.readConfigFile = function(filename, callback) {
  var fs = require('fs');
  
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      return callback(err);
    }
    
    try {
      var config = JSON.parse(data);
      callback(null, config);
    } catch (parseError) {
      callback(parseError);
    }
  });
};

// Using var in closure (common scope issue)
Utils.prototype.createCounters = function(count) {
  var counters = [];
  
  for (var i = 0; i < count; i++) {
    counters.push(function() {
      return i; // Bug: will always return 'count'
    });
  }
  
  return counters;
};

// Export using old CommonJS pattern
module.exports = new Utils();

// Made with Bob
