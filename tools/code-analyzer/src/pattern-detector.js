import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Detects legacy JavaScript patterns in source code
 */
export class PatternDetector {
  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Initialize legacy pattern definitions
   */
  initializePatterns() {
    return [
      {
        id: 'no-var',
        category: 'javascript-modernization',
        severity: 'warning',
        regex: /\bvar\s+\w+/g,
        legacy_pattern: 'var',
        modern_replacement: 'let or const',
        message: 'Avoid using var. Use let or const instead.',
        examples: {
          before: 'var x = 1;',
          after: 'const x = 1; // or let x = 1; if reassignment is needed'
        }
      },
      {
        id: 'callback-pattern',
        category: 'async-modernization',
        severity: 'warning',
        regex: /function\s*\([^)]*,\s*callback\s*\)/g,
        legacy_pattern: 'callback functions',
        modern_replacement: 'async/await',
        message: 'Replace callback pattern with async/await for better readability.',
        examples: {
          before: 'function fetchData(id, callback) {\n  request.get(url, callback);\n}',
          after: 'async function fetchData(id) {\n  const response = await axios.get(url);\n  return response.data;\n}'
        }
      },
      {
        id: 'callback-hell',
        category: 'async-modernization',
        severity: 'error',
        regex: /callback\([^)]*function\s*\([^)]*callback/g,
        legacy_pattern: 'nested callbacks',
        modern_replacement: 'async/await or Promise chain',
        message: 'Nested callbacks detected (callback hell). Refactor to async/await.',
        examples: {
          before: 'getData(id, function(err, data) {\n  processData(data, function(err, result) {\n    saveResult(result, callback);\n  });\n});',
          after: 'try {\n  const data = await getData(id);\n  const result = await processData(data);\n  await saveResult(result);\n} catch (error) {\n  // handle error\n}'
        }
      },
      {
        id: 'require-commonjs',
        category: 'module-system',
        severity: 'info',
        regex: /\brequire\s*\(/g,
        legacy_pattern: 'require()',
        modern_replacement: 'import',
        message: 'Consider migrating from CommonJS require() to ES6 import.',
        examples: {
          before: 'const express = require(\'express\');',
          after: 'import express from \'express\';'
        }
      },
      {
        id: 'module-exports',
        category: 'module-system',
        severity: 'info',
        regex: /module\.exports\s*=/g,
        legacy_pattern: 'module.exports',
        modern_replacement: 'export default or export',
        message: 'Consider migrating from CommonJS module.exports to ES6 export.',
        examples: {
          before: 'module.exports = myFunction;',
          after: 'export default myFunction;'
        }
      },
      {
        id: 'function-expression',
        category: 'function-syntax',
        severity: 'info',
        regex: /var\s+\w+\s*=\s*function\s*\(/g,
        legacy_pattern: 'function expressions with var',
        modern_replacement: 'arrow functions with const',
        message: 'Use arrow functions with const for better scoping.',
        examples: {
          before: 'var add = function(a, b) { return a + b; };',
          after: 'const add = (a, b) => a + b;'
        }
      },
      {
        id: 'string-concatenation',
        category: 'string-operations',
        severity: 'info',
        regex: /['"][^'"]*['"]\s*\+\s*\w+\s*\+/g,
        legacy_pattern: 'string concatenation with +',
        modern_replacement: 'template literals',
        message: 'Use template literals instead of string concatenation.',
        examples: {
          before: 'var message = "Hello, " + name + "!";',
          after: 'const message = `Hello, ${name}!`;'
        }
      },
      {
        id: 'prototype-method',
        category: 'oop-modernization',
        severity: 'warning',
        regex: /\w+\.prototype\.\w+\s*=\s*function/g,
        legacy_pattern: 'prototype-based methods',
        modern_replacement: 'ES6 class methods',
        message: 'Use ES6 classes instead of prototype-based inheritance.',
        examples: {
          before: 'Person.prototype.greet = function() { return "Hello"; };',
          after: 'class Person {\n  greet() { return "Hello"; }\n}'
        }
      },
      {
        id: 'arguments-object',
        category: 'function-syntax',
        severity: 'warning',
        regex: /\barguments\[/g,
        legacy_pattern: 'arguments object',
        modern_replacement: 'rest parameters',
        message: 'Use rest parameters instead of the arguments object.',
        examples: {
          before: 'function sum() {\n  var total = 0;\n  for (var i = 0; i < arguments.length; i++) {\n    total += arguments[i];\n  }\n  return total;\n}',
          after: 'function sum(...numbers) {\n  return numbers.reduce((total, num) => total + num, 0);\n}'
        }
      },
      {
        id: 'for-loop-legacy',
        category: 'array-operations',
        severity: 'info',
        regex: /for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length/g,
        legacy_pattern: 'for loop with var',
        modern_replacement: 'array methods or for...of',
        message: 'Use array methods (map, filter, forEach) or for...of loop.',
        examples: {
          before: 'for (var i = 0; i < items.length; i++) {\n  console.log(items[i]);\n}',
          after: 'items.forEach(item => console.log(item));\n// or\nfor (const item of items) {\n  console.log(item);\n}'
        }
      },
      {
        id: 'request-library',
        category: 'deprecated-api',
        severity: 'error',
        regex: /require\s*\(\s*['"]request['"]\s*\)/g,
        legacy_pattern: 'request library',
        modern_replacement: 'axios or node-fetch',
        message: 'The "request" library is deprecated. Use axios or node-fetch.',
        examples: {
          before: 'const request = require(\'request\');\nrequest.get(url, callback);',
          after: 'import axios from \'axios\';\nconst response = await axios.get(url);'
        }
      },
      {
        id: 'async-library',
        category: 'deprecated-api',
        severity: 'warning',
        regex: /require\s*\(\s*['"]async['"]\s*\)/g,
        legacy_pattern: 'async library',
        modern_replacement: 'native async/await',
        message: 'Replace async library with native async/await.',
        examples: {
          before: 'async.map(items, processItem, callback);',
          after: 'const results = await Promise.all(items.map(item => processItem(item)));'
        }
      },
      {
        id: 'q-promises',
        category: 'deprecated-api',
        severity: 'warning',
        regex: /require\s*\(\s*['"]q['"]\s*\)|Q\.defer\(\)/g,
        legacy_pattern: 'Q promises library',
        modern_replacement: 'native Promises',
        message: 'Replace Q promises with native Promise API.',
        examples: {
          before: 'const deferred = Q.defer();\nsetTimeout(() => deferred.resolve(value), 1000);\nreturn deferred.promise;',
          after: 'return new Promise(resolve => {\n  setTimeout(() => resolve(value), 1000);\n});'
        }
      },
      {
        id: 'moment-js',
        category: 'deprecated-api',
        severity: 'info',
        regex: /require\s*\(\s*['"]moment['"]\s*\)/g,
        legacy_pattern: 'moment.js',
        modern_replacement: 'date-fns or dayjs',
        message: 'Moment.js is in maintenance mode. Consider date-fns or dayjs.',
        examples: {
          before: 'const moment = require(\'moment\');\nconst formatted = moment(date).format(\'YYYY-MM-DD\');',
          after: 'import { format } from \'date-fns\';\nconst formatted = format(date, \'yyyy-MM-dd\');'
        }
      }
    ];
  }

  /**
   * Analyze source files for legacy patterns
   */
  async analyzeProject(projectPath) {
    const srcPath = path.join(projectPath, 'src');
    
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source directory not found at ${srcPath}`);
    }

    // Find all JavaScript files
    const files = await glob('**/*.js', { cwd: srcPath, absolute: true });
    
    const results = {
      filesAnalyzed: files.length,
      patterns: [],
      fileResults: []
    };

    for (const file of files) {
      const fileResult = this.analyzeFile(file, projectPath);
      if (fileResult.patterns.length > 0) {
        results.fileResults.push(fileResult);
        results.patterns.push(...fileResult.patterns);
      }
    }

    // Group patterns by type
    results.summary = this.summarizePatterns(results.patterns);

    return results;
  }

  /**
   * Analyze a single file for legacy patterns
   */
  analyzeFile(filePath, projectPath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(projectPath, filePath);
    
    const patterns = [];

    for (const pattern of this.patterns) {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        // Find line numbers for each match
        const occurrences = [];
        
        lines.forEach((line, index) => {
          if (pattern.regex.test(line)) {
            occurrences.push({
              line: index + 1,
              code: line.trim()
            });
          }
        });

        patterns.push({
          ...pattern,
          file: relativePath,
          matchCount: matches.length,
          occurrences
        });
      }
    }

    return {
      file: relativePath,
      patterns
    };
  }

  /**
   * Summarize detected patterns
   */
  summarizePatterns(patterns) {
    const summary = {
      byCategory: {},
      bySeverity: {},
      total: patterns.length
    };

    patterns.forEach(pattern => {
      // By category
      if (!summary.byCategory[pattern.category]) {
        summary.byCategory[pattern.category] = 0;
      }
      summary.byCategory[pattern.category]++;

      // By severity
      if (!summary.bySeverity[pattern.severity]) {
        summary.bySeverity[pattern.severity] = 0;
      }
      summary.bySeverity[pattern.severity]++;
    });

    return summary;
  }

  /**
   * Generate modernization rules from detected patterns
   */
  generatePatternRules(analysisResult) {
    const rules = [];
    const uniquePatterns = new Map();

    // Deduplicate patterns by id
    for (const pattern of analysisResult.patterns) {
      if (!uniquePatterns.has(pattern.id)) {
        uniquePatterns.set(pattern.id, {
          ...pattern,
          files: [pattern.file],
          totalOccurrences: pattern.matchCount
        });
      } else {
        const existing = uniquePatterns.get(pattern.id);
        existing.files.push(pattern.file);
        existing.totalOccurrences += pattern.matchCount;
      }
    }

    // Convert to rules format
    for (const [id, pattern] of uniquePatterns) {
      rules.push({
        id: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        legacy_pattern: pattern.legacy_pattern,
        modern_replacement: pattern.modern_replacement,
        message: pattern.message,
        examples: pattern.examples,
        occurrences: pattern.totalOccurrences,
        affectedFiles: pattern.files.length,
        files: pattern.files
      });
    }

    return rules;
  }
}

// Made with Bob
