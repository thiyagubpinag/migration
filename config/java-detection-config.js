/**
 * Java Language Detection Configuration
 * Detects Java version and language features from source code
 */

export const javaVersionPatterns = {
  // Java version detection patterns
  versions: {
    '1.8': {
      features: ['lambda', 'stream', 'Optional', 'default methods', 'method references'],
      patterns: [
        /\-\>/,  // Lambda expressions
        /\.stream\(\)/,  // Stream API
        /Optional\</,  // Optional class
        /@FunctionalInterface/
      ]
    },
    '11': {
      features: ['var', 'HTTP Client', 'String methods', 'Collection.toArray'],
      patterns: [
        /\bvar\s+\w+\s*=/,  // Local variable type inference
        /HttpClient/,
        /\.isBlank\(\)/,
        /\.lines\(\)/,
        /\.repeat\(/
      ]
    },
    '17': {
      features: ['sealed classes', 'pattern matching', 'records', 'text blocks'],
      patterns: [
        /\bsealed\s+class/,
        /\brecord\s+\w+/,
        /"""\s*[\s\S]*?"""/,  // Text blocks
        /instanceof\s+\w+\s+\w+/  // Pattern matching for instanceof
      ]
    },
    '21': {
      features: ['virtual threads', 'pattern matching for switch', 'record patterns', 'sequenced collections'],
      patterns: [
        /Thread\.ofVirtual\(\)/,
        /switch\s*\([^)]+\)\s*\{[^}]*case\s+\w+\s+\w+/,  // Pattern matching in switch
        /SequencedCollection/,
        /\.reversed\(\)/
      ]
    }
  },

  // Deprecated API patterns by version
  deprecatedAPIs: {
    '1.8': [
      { pattern: /new Date\(\)/, replacement: 'LocalDateTime.now()', reason: 'Use java.time API' },
      { pattern: /new SimpleDateFormat/, replacement: 'DateTimeFormatter', reason: 'Use java.time formatters' }
    ],
    '9': [
      { pattern: /new Integer\(/, replacement: 'Integer.valueOf()', reason: 'Constructor deprecated' },
      { pattern: /new Long\(/, replacement: 'Long.valueOf()', reason: 'Constructor deprecated' },
      { pattern: /new Double\(/, replacement: 'Double.valueOf()', reason: 'Constructor deprecated' }
    ],
    '11': [
      { pattern: /Thread\.destroy\(\)/, replacement: 'Thread.interrupt()', reason: 'Method removed' },
      { pattern: /Thread\.stop\(\)/, replacement: 'Thread.interrupt()', reason: 'Method removed' }
    ],
    '17': [
      { pattern: /SecurityManager/, replacement: 'Alternative security mechanisms', reason: 'Deprecated for removal' }
    ]
  },

  // Common anti-patterns
  antiPatterns: [
    {
      name: 'raw-types',
      pattern: /\b(List|Set|Map|Collection)\s+\w+\s*=\s*new\s+(ArrayList|HashSet|HashMap)/,
      message: 'Use generic types instead of raw types',
      severity: 'warning'
    },
    {
      name: 'string-concatenation-in-loop',
      pattern: /for\s*\([^)]+\)\s*\{[^}]*\+=/,
      message: 'Use StringBuilder for string concatenation in loops',
      severity: 'warning'
    },
    {
      name: 'missing-try-with-resources',
      pattern: /(FileInputStream|FileOutputStream|BufferedReader|BufferedWriter)[^}]*\.close\(\)/,
      message: 'Use try-with-resources for automatic resource management',
      severity: 'error'
    },
    {
      name: 'null-check-instead-of-optional',
      pattern: /if\s*\(\s*\w+\s*!=\s*null\s*\)/,
      message: 'Consider using Optional instead of null checks',
      severity: 'info'
    },
    {
      name: 'anonymous-class-instead-of-lambda',
      pattern: /new\s+\w+\s*\(\s*\)\s*\{[^}]*@Override[^}]*\}/,
      message: 'Consider using lambda expression instead of anonymous class',
      severity: 'info'
    }
  ],

  // Security patterns
  securityPatterns: [
    {
      name: 'hardcoded-password',
      pattern: /(password|passwd|pwd)\s*=\s*["'][^"']+["']/i,
      message: 'Hardcoded password detected - use environment variables or secure vault',
      severity: 'critical'
    },
    {
      name: 'sql-injection-risk',
      pattern: /Statement\s+\w+\s*=.*executeQuery\s*\(\s*["'].*\+/,
      message: 'Potential SQL injection - use PreparedStatement',
      severity: 'critical'
    },
    {
      name: 'insecure-random',
      pattern: /new\s+Random\(\)/,
      message: 'Use SecureRandom for security-sensitive operations',
      severity: 'warning'
    },
    {
      name: 'weak-crypto',
      pattern: /(DES|MD5|SHA1)/,
      message: 'Weak cryptographic algorithm - use AES, SHA-256 or better',
      severity: 'error'
    }
  ]
};

/**
 * Detect Java version from source code
 * @param {string} sourceCode - Java source code
 * @returns {string} Detected Java version
 */
export function detectJavaVersion(sourceCode) {
  const versions = Object.keys(javaVersionPatterns.versions).reverse(); // Check newest first
  
  for (const version of versions) {
    const { patterns } = javaVersionPatterns.versions[version];
    const matchCount = patterns.filter(pattern => pattern.test(sourceCode)).length;
    
    if (matchCount > 0) {
      return version;
    }
  }
  
  return '1.8'; // Default to Java 8 if no modern features detected
}

/**
 * Get recommended Java version
 * @param {string} currentVersion - Current Java version
 * @returns {string} Recommended Java version
 */
export function getRecommendedVersion(currentVersion) {
  const versionMap = {
    '1.8': '21',
    '11': '21',
    '17': '21',
    '21': '21'
  };
  
  return versionMap[currentVersion] || '21';
}

/**
 * Get breaking changes between versions
 * @param {string} fromVersion - Source version
 * @param {string} toVersion - Target version
 * @returns {Array} List of breaking changes
 */
export function getBreakingChanges(fromVersion, toVersion) {
  const changes = [];
  const versions = ['1.8', '9', '11', '17', '21'];
  const fromIndex = versions.indexOf(fromVersion);
  const toIndex = versions.indexOf(toVersion);
  
  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    return changes;
  }
  
  // Collect deprecated APIs between versions
  for (let i = fromIndex; i < toIndex; i++) {
    const version = versions[i];
    if (javaVersionPatterns.deprecatedAPIs[version]) {
      changes.push(...javaVersionPatterns.deprecatedAPIs[version]);
    }
  }
  
  return changes;
}

export default {
  javaVersionPatterns,
  detectJavaVersion,
  getRecommendedVersion,
  getBreakingChanges
};

// Made with Bob
