# IBM JavaScript Modernization Guidelines

## Version: 2024.1
**Last Updated:** November 2024

---

## Table of Contents
1. [Variable Declarations](#variable-declarations)
2. [Asynchronous Programming](#asynchronous-programming)
3. [Function Syntax](#function-syntax)
4. [Module System](#module-system)
5. [Array and Object Operations](#array-and-object-operations)
6. [Error Handling](#error-handling)
7. [String Operations](#string-operations)
8. [Class and Object-Oriented Programming](#class-and-object-oriented-programming)
9. [Dependency Management](#dependency-management)
10. [Security Best Practices](#security-best-practices)

---

## 1. Variable Declarations

### ❌ Legacy Pattern
```javascript
var x = 1;
var name = 'John';
```

### ✅ Modern Pattern
```javascript
const x = 1;        // Use const for values that won't be reassigned
let name = 'John';  // Use let for values that will be reassigned
```

**Rationale:** `var` has function scope and hoisting issues. `const` and `let` have block scope and prevent common bugs.

**Migration Priority:** HIGH

---

## 2. Asynchronous Programming

### ❌ Legacy Pattern: Callbacks
```javascript
function fetchData(callback) {
  request.get(url, function(error, response, body) {
    if (error) {
      return callback(error);
    }
    callback(null, body);
  });
}
```

### ✅ Modern Pattern: Async/Await
```javascript
async function fetchData() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

**Rationale:** Async/await provides cleaner, more readable asynchronous code and better error handling.

**Migration Priority:** HIGH

### ❌ Legacy Pattern: Promise Libraries (Q, Bluebird)
```javascript
const Q = require('q');
const deferred = Q.defer();
setTimeout(() => deferred.resolve(value), 1000);
return deferred.promise;
```

### ✅ Modern Pattern: Native Promises
```javascript
function delay(value, ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}
```

**Migration Priority:** MEDIUM

---

## 3. Function Syntax

### ❌ Legacy Pattern: Function Expressions
```javascript
var add = function(a, b) {
  return a + b;
};
```

### ✅ Modern Pattern: Arrow Functions
```javascript
const add = (a, b) => a + b;

// For multi-line functions
const processData = (data) => {
  const filtered = data.filter(item => item.active);
  return filtered.map(item => item.value);
};
```

**Rationale:** Arrow functions have lexical `this` binding and more concise syntax.

**Migration Priority:** MEDIUM

---

## 4. Module System

### ❌ Legacy Pattern: CommonJS
```javascript
const express = require('express');
module.exports = myFunction;
```

### ✅ Modern Pattern: ES Modules
```javascript
import express from 'express';
export default myFunction;
export { namedExport1, namedExport2 };
```

**Rationale:** ES modules are the standard and provide better tree-shaking and static analysis.

**Migration Priority:** MEDIUM (requires Node.js 14+)

---

## 5. Array and Object Operations

### ❌ Legacy Pattern: Manual Loops
```javascript
var result = [];
for (var i = 0; i < items.length; i++) {
  if (items[i].active) {
    result.push(items[i]);
  }
}
```

### ✅ Modern Pattern: Array Methods
```javascript
const result = items.filter(item => item.active);
```

### ❌ Legacy Pattern: Lodash for Simple Operations
```javascript
const _ = require('lodash');
const names = _.map(users, function(user) {
  return user.name;
});
```

### ✅ Modern Pattern: Native Array Methods
```javascript
const names = users.map(user => user.name);
```

**Rationale:** Native array methods are performant and don't require external dependencies.

**Migration Priority:** MEDIUM

---

## 6. Error Handling

### ❌ Legacy Pattern: Callback Error Handling
```javascript
function processData(data, callback) {
  if (!data) {
    return callback(new Error('No data'));
  }
  callback(null, result);
}
```

### ✅ Modern Pattern: Try/Catch with Async/Await
```javascript
async function processData(data) {
  if (!data) {
    throw new Error('No data');
  }
  return result;
}

// Usage
try {
  const result = await processData(data);
} catch (error) {
  console.error('Error:', error.message);
}
```

**Migration Priority:** HIGH

---

## 7. String Operations

### ❌ Legacy Pattern: String Concatenation
```javascript
var message = 'Hello, ' + name + '! You have ' + count + ' messages.';
```

### ✅ Modern Pattern: Template Literals
```javascript
const message = `Hello, ${name}! You have ${count} messages.`;
```

**Migration Priority:** LOW (but recommended)

---

## 8. Class and Object-Oriented Programming

### ❌ Legacy Pattern: Prototype-based
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return 'Hello, ' + this.name;
};
```

### ✅ Modern Pattern: ES6 Classes
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}
```

**Migration Priority:** MEDIUM

---

## 9. Dependency Management

### Deprecated Packages to Replace

| Legacy Package | Status | Modern Alternative | Priority |
|---------------|--------|-------------------|----------|
| `request` | Deprecated | `axios` or `node-fetch` | HIGH |
| `async` | Legacy | Native async/await | HIGH |
| `q` | Deprecated | Native Promises | HIGH |
| `bluebird` | Legacy | Native Promises | MEDIUM |
| `moment` | Maintenance | `date-fns` or `dayjs` | MEDIUM |
| `underscore` | Legacy | `lodash` or native methods | LOW |
| `gulp` | Legacy | npm scripts or webpack | LOW |
| `grunt` | Legacy | npm scripts or webpack | LOW |

### Version Requirements

- **Node.js:** Minimum version 18.x (LTS)
- **Express:** Minimum version 4.19.x
- **Lodash:** Version 4.17.21 (if used)

---

## 10. Security Best Practices

### Package Security
- Always use the latest stable versions
- Run `npm audit` regularly
- Update dependencies with known vulnerabilities immediately
- Use `npm audit fix` to automatically fix issues

### Code Security
- Never use `eval()` or `Function()` constructor with user input
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization

---

## Migration Checklist

- [ ] Replace all `var` with `const` or `let`
- [ ] Convert callbacks to async/await
- [ ] Replace deprecated packages (request, async, q, etc.)
- [ ] Update to latest approved package versions
- [ ] Replace prototype-based code with ES6 classes
- [ ] Use arrow functions where appropriate
- [ ] Replace string concatenation with template literals
- [ ] Use native array methods instead of loops
- [ ] Implement proper error handling with try/catch
- [ ] Run security audit and fix vulnerabilities

---

## Automated Tools

IBM recommends using the following tools for automated migration:

1. **ESLint** - For code quality and pattern detection
2. **jscodeshift** - For automated code transformations
3. **npm-check-updates** - For dependency updates
4. **npm audit** - For security vulnerability detection

---

## Support and Resources

- **IBM Developer Portal:** https://developer.ibm.com
- **Internal Wiki:** [Link to internal documentation]
- **Migration Support Team:** migration-support@ibm.com

---

**Document Owner:** IBM JavaScript Standards Committee  
**Review Cycle:** Quarterly