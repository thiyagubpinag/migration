// Legacy JavaScript patterns - needs modernization

var express = require('express');
var request = require('request');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');

var app = express();
var PORT = 3000;

// Using var instead of let/const
var users = [];
var config = {
  apiUrl: 'http://api.example.com',
  timeout: 5000
};

// Callback-based async pattern (legacy)
function fetchUserData(userId, callback) {
  request.get(config.apiUrl + '/users/' + userId, function(error, response, body) {
    if (error) {
      return callback(error);
    }
    callback(null, JSON.parse(body));
  });
}

// Nested callbacks (callback hell)
function processUser(userId, callback) {
  fetchUserData(userId, function(err, user) {
    if (err) {
      return callback(err);
    }
    
    // Legacy lodash usage
    var filteredData = _.filter(user.data, function(item) {
      return item.active === true;
    });
    
    // Old-style string concatenation
    var message = 'User ' + user.name + ' has ' + filteredData.length + ' active items';
    
    callback(null, {
      user: user,
      message: message,
      data: filteredData
    });
  });
}

// Using async library for control flow (legacy pattern)
function processMultipleUsers(userIds, callback) {
  async.map(userIds, function(userId, cb) {
    processUser(userId, cb);
  }, function(err, results) {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

// Legacy route handler with callback
app.get('/users/:id', function(req, res) {
  var userId = req.params.id;
  
  processUser(userId, function(err, result) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// Using var in loop (common mistake)
app.get('/all-users', function(req, res) {
  var userList = [];
  
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    userList.push({
      id: user.id,
      name: user.name,
      // Legacy date formatting
      createdAt: moment(user.createdAt).format('YYYY-MM-DD')
    });
  }
  
  res.json(userList);
});

// Legacy error handling
app.use(function(err, req, res, next) {
  console.log('Error occurred: ' + err.message);
  res.status(500).send('Something broke!');
});

// Old-style server start
app.listen(PORT, function() {
  console.log('Server is running on port ' + PORT);
});

module.exports = app;

// Made with Bob
