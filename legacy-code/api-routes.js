/**
 * Legacy API Routes - Express.js with anti-patterns
 */

var express = require('express');
var router = express.Router();
var userService = require('./user-service');

// Anti-pattern: No error handling middleware
// Anti-pattern: No input validation
// Anti-pattern: Callback-based async
router.post('/users', function(req, res) {
  var userData = req.body;
  userService.createUser(userData, function(err, user) {
    if (err) {
      res.status(500).send('Error creating user');
    } else {
      res.json(user);
    }
  });
});

// Anti-pattern: No authentication/authorization
router.get('/users/:id', function(req, res) {
  var userId = parseInt(req.params.id);
  userService.getUserById(userId, function(err, user) {
    if (err) {
      res.status(500).send('Error fetching user');
    } else if (!user) {
      res.status(404).send('User not found');
    } else {
      res.json(user);
    }
  });
});

// Anti-pattern: No rate limiting
// Anti-pattern: Synchronous operations in route handler
router.delete('/users/:id', function(req, res) {
  var userId = parseInt(req.params.id);
  var result = userService.deleteUser(userId);
  if (result) {
    res.status(204).send();
  } else {
    res.status(404).send('User not found');
  }
});

// Anti-pattern: No request logging
router.put('/users/:id', function(req, res) {
  var userId = parseInt(req.params.id);
  var updates = req.body;
  userService.updateUser(userId, updates, function(err, user) {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.json(user);
    }
  });
});

module.exports = router;

// Made with Bob
