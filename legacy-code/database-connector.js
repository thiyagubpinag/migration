/**
 * Legacy Database Connector - Outdated patterns
 */

// Anti-pattern: Using require instead of import
var mysql = require('mysql');

// Anti-pattern: Hardcoded credentials
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'myapp'
});

// Anti-pattern: No connection pooling
connection.connect(function(err) {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});

// Anti-pattern: Callback hell
function executeQuery(query, params, callback) {
  connection.query(query, params, function(error, results, fields) {
    if (error) {
      callback(error);
      return;
    }
    callback(null, results);
  });
}

// Anti-pattern: No prepared statements
function getUserByEmail(email, callback) {
  var query = "SELECT * FROM users WHERE email = '" + email + "'";
  executeQuery(query, [], callback);
}

// Anti-pattern: No transaction support
function createUserWithProfile(userData, profileData, callback) {
  var insertUser = "INSERT INTO users SET ?";
  executeQuery(insertUser, userData, function(err, result) {
    if (err) {
      callback(err);
      return;
    }
    
    var userId = result.insertId;
    profileData.user_id = userId;
    var insertProfile = "INSERT INTO profiles SET ?";
    
    executeQuery(insertProfile, profileData, function(err, result) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, { userId: userId, profileId: result.insertId });
    });
  });
}

// Anti-pattern: No proper cleanup
process.on('exit', function() {
  connection.end();
});

module.exports = {
  executeQuery: executeQuery,
  getUserByEmail: getUserByEmail,
  createUserWithProfile: createUserWithProfile
};

// Made with Bob
