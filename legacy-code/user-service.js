/**
 * Legacy User Service - Contains anti-patterns and outdated practices
 * This code needs modernization to IBM standards
 */

// Anti-pattern: Using var instead of const/let
var users = [];
var userIdCounter = 1;

// Anti-pattern: Callback-based async operations
function getUserById(id, callback) {
  setTimeout(function() {
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        user = users[i];
        break;
      }
    }
    callback(null, user);
  }, 100);
}

// Anti-pattern: No error handling
function createUser(userData, callback) {
  var newUser = {
    id: userIdCounter++,
    name: userData.name,
    email: userData.email,
    createdAt: new Date()
  };
  users.push(newUser);
  callback(null, newUser);
}

// Anti-pattern: Synchronous operations that should be async
function deleteUser(id) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      users.splice(i, 1);
      return true;
    }
  }
  return false;
}

// Anti-pattern: No input validation
function updateUser(id, updates, callback) {
  getUserById(id, function(err, user) {
    if (user) {
      user.name = updates.name || user.name;
      user.email = updates.email || user.email;
      user.updatedAt = new Date();
      callback(null, user);
    } else {
      callback(new Error('User not found'));
    }
  });
}

// Anti-pattern: Global exports
module.exports = {
  getUserById: getUserById,
  createUser: createUser,
  deleteUser: deleteUser,
  updateUser: updateUser
};

// Made with Bob
