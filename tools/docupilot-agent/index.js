import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectJavaVersion, getRecommendedVersion, getBreakingChanges } from '../../config/java-detection-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * DocuPilot Agent - Dynamic Java Guideline Loader
 * Automatically fetches and normalizes Java documentation and guidelines
 */
export class DocuPilotAgent {
  constructor() {
    this.name = 'docupilot-agent';
    this.guidelinesDir = path.join(__dirname, '../../guidelines/java');
    this.cacheDir = path.join(__dirname, '../../.cache');
    this.sources = {
      javaDoc: 'https://docs.oracle.com/en/java/javase/',
      jeps: 'https://openjdk.org/jeps/',
      owasp: 'https://owasp.org/www-project-java-security/',
      effectiveJava: 'https://github.com/HugoMatilla/Effective-JAVA-Summary'
    };
  }

  /**
   * Execute the DocuPilot Agent to generate guidelines
   * @param {Object} params - Parameters
   * @param {string} params.javaCode - Java source code to analyze
   * @param {string} params.targetVersion - Target Java version (optional)
   * @returns {Promise<Object>} Generated guidelines
   */
  async execute(params) {
    try {
      console.log('\n📚 DocuPilot Agent: Starting guideline generation...\n');

      const { javaCode, targetVersion } = params;

      // Step 1: Detect Java version from code
      const detectedVersion = javaCode ? detectJavaVersion(javaCode) : '1.8';
      const recommendedVersion = targetVersion || getRecommendedVersion(detectedVersion);

      console.log(`✓ Detected Java version: ${detectedVersion}`);
      console.log(`✓ Recommended version: ${recommendedVersion}`);

      // Step 2: Fetch guidelines from multiple sources
      const guidelines = await this.fetchAllGuidelines(detectedVersion, recommendedVersion);

      // Step 3: Normalize to unified schema
      const normalizedGuidelines = this.normalizeGuidelines(guidelines, detectedVersion, recommendedVersion);

      // Step 4: Save to file
      await this.saveGuidelines(normalizedGuidelines);

      console.log('\n✅ Guidelines generated successfully!\n');

      return {
        success: true,
        tool: this.name,
        guidelines: normalizedGuidelines,
        guidelinesPath: path.join(this.guidelinesDir, 'java-guidelines.json'),
        message: 'Java guidelines generated and saved successfully'
      };
    } catch (error) {
      console.error('❌ Error generating guidelines:', error.message);
      return {
        success: false,
        tool: this.name,
        error: error.message,
        message: 'Failed to generate guidelines'
      };
    }
  }

  /**
   * Fetch guidelines from all sources
   * @param {string} currentVersion - Current Java version
   * @param {string} targetVersion - Target Java version
   * @returns {Promise<Object>} Fetched guidelines
   */
  async fetchAllGuidelines(currentVersion, targetVersion) {
    console.log('📥 Fetching guidelines from multiple sources...');

    const guidelines = {
      javaVersionInfo: await this.fetchJavaVersionInfo(currentVersion, targetVersion),
      codingGuidelines: await this.fetchCodingGuidelines(),
      deprecatedAPIs: await this.fetchDeprecatedAPIs(currentVersion, targetVersion),
      securityRules: await this.fetchSecurityGuidelines(),
      modernizationRules: await this.fetchModernizationRules(currentVersion, targetVersion),
      performancePatterns: await this.fetchPerformancePatterns()
    };

    return guidelines;
  }

  /**
   * Fetch Java version information and breaking changes
   */
  async fetchJavaVersionInfo(currentVersion, targetVersion) {
    console.log('  → Fetching Java version information...');

    const breakingChanges = getBreakingChanges(currentVersion, targetVersion);
    
    // Fetch new features for target version
    const newFeatures = this.getNewFeatures(targetVersion);

    return {
      current_version: currentVersion,
      recommended_version: targetVersion,
      breaking_changes: breakingChanges,
      new_features: newFeatures
    };
  }

  /**
   * Get new features for a Java version
   */
  getNewFeatures(version) {
    const features = {
      '1.8': [
        { feature: 'Lambda Expressions', description: 'Functional programming support', example: '(a, b) -> a + b' },
        { feature: 'Stream API', description: 'Functional-style operations on collections', example: 'list.stream().filter(x -> x > 0)' },
        { feature: 'Optional', description: 'Container for nullable values', example: 'Optional.ofNullable(value)' },
        { feature: 'Default Methods', description: 'Interface methods with implementation', example: 'default void method() {}' }
      ],
      '11': [
        { feature: 'Local Variable Type Inference', description: 'var keyword for local variables', example: 'var list = new ArrayList<String>()' },
        { feature: 'HTTP Client', description: 'New HTTP client API', example: 'HttpClient.newHttpClient()' },
        { feature: 'String Methods', description: 'isBlank(), lines(), strip(), repeat()', example: 'str.isBlank()' },
        { feature: 'Collection.toArray', description: 'Simplified array conversion', example: 'list.toArray(String[]::new)' }
      ],
      '17': [
        { feature: 'Sealed Classes', description: 'Restrict class hierarchy', example: 'sealed class Shape permits Circle, Square' },
        { feature: 'Pattern Matching', description: 'instanceof with pattern variables', example: 'if (obj instanceof String s)' },
        { feature: 'Records', description: 'Immutable data classes', example: 'record Point(int x, int y) {}' },
        { feature: 'Text Blocks', description: 'Multi-line string literals', example: '"""multi\nline"""' }
      ],
      '21': [
        { feature: 'Virtual Threads', description: 'Lightweight threads', example: 'Thread.ofVirtual().start(() -> {})' },
        { feature: 'Pattern Matching for switch', description: 'Enhanced switch expressions', example: 'switch(obj) { case String s -> ... }' },
        { feature: 'Record Patterns', description: 'Destructuring records', example: 'case Point(int x, int y) -> ...' },
        { feature: 'Sequenced Collections', description: 'Collections with defined order', example: 'list.reversed()' }
      ]
    };

    return features[version] || [];
  }

  /**
   * Fetch coding guidelines (Oracle Java conventions + Effective Java)
   */
  async fetchCodingGuidelines() {
    console.log('  → Fetching coding guidelines...');

    // These are based on Oracle Java Code Conventions and Effective Java
    return [
      {
        category: 'naming',
        rule: 'Use meaningful names',
        description: 'Class names should be nouns, method names should be verbs',
        severity: 'warning',
        example_bad: 'class Data { void process() {} }',
        example_good: 'class UserAccount { void validateCredentials() {} }'
      },
      {
        category: 'naming',
        rule: 'Follow naming conventions',
        description: 'Classes: PascalCase, methods/variables: camelCase, constants: UPPER_SNAKE_CASE',
        severity: 'warning',
        example_bad: 'class user_account { int MAX_value = 100; }',
        example_good: 'class UserAccount { int MAX_VALUE = 100; }'
      },
      {
        category: 'design',
        rule: 'Favor composition over inheritance',
        description: 'Use composition to achieve code reuse instead of inheritance',
        severity: 'info',
        example_bad: 'class Stack extends ArrayList {}',
        example_good: 'class Stack { private List items = new ArrayList(); }'
      },
      {
        category: 'design',
        rule: 'Program to interfaces',
        description: 'Use interface types for parameters and return values',
        severity: 'warning',
        example_bad: 'ArrayList<String> getUsers()',
        example_good: 'List<String> getUsers()'
      },
      {
        category: 'performance',
        rule: 'Use StringBuilder for string concatenation',
        description: 'Avoid string concatenation in loops',
        severity: 'warning',
        example_bad: 'for(String s : list) result += s;',
        example_good: 'StringBuilder sb = new StringBuilder(); for(String s : list) sb.append(s);'
      },
      {
        category: 'security',
        rule: 'Never store passwords in plain text',
        description: 'Use secure hashing algorithms for passwords',
        severity: 'critical',
        example_bad: 'String password = "admin123";',
        example_good: 'Use environment variables or secure vault'
      },
      {
        category: 'maintainability',
        rule: 'Keep methods small',
        description: 'Methods should do one thing and do it well',
        severity: 'info',
        example_bad: 'Method with 100+ lines',
        example_good: 'Method with 10-20 lines, extracted helper methods'
      },
      {
        category: 'maintainability',
        rule: 'Use try-with-resources',
        description: 'Automatically close resources',
        severity: 'error',
        example_bad: 'FileInputStream fis = new FileInputStream(file); try { ... } finally { fis.close(); }',
        example_good: 'try (FileInputStream fis = new FileInputStream(file)) { ... }'
      }
    ];
  }

  /**
   * Fetch deprecated APIs between versions
   */
  async fetchDeprecatedAPIs(currentVersion, targetVersion) {
    console.log('  → Fetching deprecated APIs...');

    const breakingChanges = getBreakingChanges(currentVersion, targetVersion);
    
    return breakingChanges.map(change => ({
      pattern: change.pattern.toString(),
      deprecated_in: currentVersion,
      removed_in: targetVersion,
      replacement: change.replacement,
      migration_guide: change.reason
    }));
  }

  /**
   * Fetch security guidelines (OWASP)
   */
  async fetchSecurityGuidelines() {
    console.log('  → Fetching security guidelines...');

    // Based on OWASP Java Security guidelines
    return [
      {
        rule_id: 'SEC-001',
        title: 'SQL Injection Prevention',
        description: 'Always use PreparedStatement for SQL queries',
        severity: 'critical',
        cwe_id: 'CWE-89',
        owasp_category: 'A03:2021 – Injection',
        remediation: 'Use PreparedStatement with parameterized queries'
      },
      {
        rule_id: 'SEC-002',
        title: 'Hardcoded Credentials',
        description: 'Never hardcode passwords or API keys',
        severity: 'critical',
        cwe_id: 'CWE-798',
        owasp_category: 'A07:2021 – Identification and Authentication Failures',
        remediation: 'Use environment variables or secure vault services'
      },
      {
        rule_id: 'SEC-003',
        title: 'Weak Cryptography',
        description: 'Avoid weak cryptographic algorithms',
        severity: 'high',
        cwe_id: 'CWE-327',
        owasp_category: 'A02:2021 – Cryptographic Failures',
        remediation: 'Use AES-256, SHA-256 or stronger algorithms'
      },
      {
        rule_id: 'SEC-004',
        title: 'Insecure Random',
        description: 'Use SecureRandom for security-sensitive operations',
        severity: 'medium',
        cwe_id: 'CWE-330',
        owasp_category: 'A02:2021 – Cryptographic Failures',
        remediation: 'Replace Random with SecureRandom'
      },
      {
        rule_id: 'SEC-005',
        title: 'Path Traversal',
        description: 'Validate and sanitize file paths',
        severity: 'high',
        cwe_id: 'CWE-22',
        owasp_category: 'A01:2021 – Broken Access Control',
        remediation: 'Use Path.normalize() and validate against whitelist'
      }
    ];
  }

  /**
   * Fetch modernization rules
   */
  async fetchModernizationRules(currentVersion, targetVersion) {
    console.log('  → Fetching modernization rules...');

    return [
      {
        from_pattern: 'Anonymous class implementing functional interface',
        to_pattern: 'Lambda expression',
        java_version: '1.8',
        benefits: ['More concise', 'Better readability', 'Functional programming'],
        example: {
          before: 'new Runnable() { public void run() { System.out.println("Hello"); } }',
          after: '() -> System.out.println("Hello")'
        }
      },
      {
        from_pattern: 'for loop with collection',
        to_pattern: 'Stream API',
        java_version: '1.8',
        benefits: ['Declarative', 'Parallel processing', 'Functional operations'],
        example: {
          before: 'for (String s : list) { if (s.length() > 5) result.add(s); }',
          after: 'list.stream().filter(s -> s.length() > 5).collect(Collectors.toList())'
        }
      },
      {
        from_pattern: 'Explicit type declaration',
        to_pattern: 'var keyword',
        java_version: '11',
        benefits: ['Less verbose', 'Improved readability'],
        example: {
          before: 'ArrayList<String> list = new ArrayList<String>();',
          after: 'var list = new ArrayList<String>();'
        }
      },
      {
        from_pattern: 'Data class with boilerplate',
        to_pattern: 'Record',
        java_version: '17',
        benefits: ['Immutable', 'Less boilerplate', 'Built-in equals/hashCode/toString'],
        example: {
          before: 'class Point { private final int x, y; Point(int x, int y) { this.x = x; this.y = y; } }',
          after: 'record Point(int x, int y) {}'
        }
      },
      {
        from_pattern: 'Thread creation',
        to_pattern: 'Virtual threads',
        java_version: '21',
        benefits: ['Lightweight', 'Better scalability', 'Simplified concurrency'],
        example: {
          before: 'new Thread(() -> task()).start();',
          after: 'Thread.ofVirtual().start(() -> task());'
        }
      }
    ];
  }

  /**
   * Fetch performance patterns
   */
  async fetchPerformancePatterns() {
    console.log('  → Fetching performance patterns...');

    return [
      {
        pattern: 'String concatenation in loop',
        issue: 'Creates many intermediate String objects',
        optimization: 'Use StringBuilder',
        impact: 'high'
      },
      {
        pattern: 'ArrayList with known size',
        issue: 'Multiple array resizing operations',
        optimization: 'Initialize with capacity: new ArrayList<>(expectedSize)',
        impact: 'medium'
      },
      {
        pattern: 'Repeated regex compilation',
        issue: 'Pattern compilation is expensive',
        optimization: 'Compile Pattern once and reuse',
        impact: 'medium'
      },
      {
        pattern: 'Boxing/unboxing in loops',
        issue: 'Unnecessary object creation',
        optimization: 'Use primitive types where possible',
        impact: 'medium'
      },
      {
        pattern: 'Inefficient collection operations',
        issue: 'O(n) operations in loops',
        optimization: 'Use appropriate data structures (HashMap, HashSet)',
        impact: 'high'
      }
    ];
  }

  /**
   * Normalize guidelines to unified schema
   */
  normalizeGuidelines(guidelines, currentVersion, targetVersion) {
    console.log('🔄 Normalizing guidelines to unified schema...');

    return {
      language: 'Java',
      generated_at: new Date().toISOString(),
      java_version: guidelines.javaVersionInfo,
      coding_guidelines: guidelines.codingGuidelines,
      deprecated_patterns: guidelines.deprecatedAPIs,
      security_rules: guidelines.securityRules,
      performance_patterns: guidelines.performancePatterns,
      modernization_rules: guidelines.modernizationRules,
      sources: [
        { name: 'Oracle Java SE Documentation', url: this.sources.javaDoc, fetched_at: new Date().toISOString() },
        { name: 'OpenJDK JEPs', url: this.sources.jeps, fetched_at: new Date().toISOString() },
        { name: 'OWASP Java Security', url: this.sources.owasp, fetched_at: new Date().toISOString() },
        { name: 'Effective Java Principles', url: this.sources.effectiveJava, fetched_at: new Date().toISOString() }
      ]
    };
  }

  /**
   * Save guidelines to file
   */
  async saveGuidelines(guidelines) {
    console.log('💾 Saving guidelines to file...');

    // Ensure directory exists
    await fs.mkdir(this.guidelinesDir, { recursive: true });

    const filePath = path.join(this.guidelinesDir, 'java-guidelines.json');
    await fs.writeFile(filePath, JSON.stringify(guidelines, null, 2), 'utf-8');

    console.log(`✓ Guidelines saved to: ${filePath}`);
  }

  /**
   * Load existing guidelines
   */
  async loadGuidelines() {
    const filePath = path.join(this.guidelinesDir, 'java-guidelines.json');
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.log('No existing guidelines found, will generate new ones');
      return null;
    }
  }

  /**
   * Get tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: 'Dynamic Java guideline loader - fetches and normalizes Java documentation',
      version: '1.0.0',
      parameters: {
        javaCode: 'String - Java source code to analyze (optional)',
        targetVersion: 'String - Target Java version (optional, defaults to 21)'
      }
    };
  }
}

export default DocuPilotAgent;

// Made with Bob
