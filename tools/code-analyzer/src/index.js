#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DependencyAnalyzer } from './dependency-analyzer.js';
import { PatternDetector } from './pattern-detector.js';
import { RuleGenerator } from './rule-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * IBM Code Analyzer - Main Entry Point
 * Analyzes legacy codebases and generates modernization recommendations
 */
class CodeAnalyzer {
  constructor() {
    this.projectPath = null;
    this.ibmStandardsPath = null;
    this.outputPath = null;
  }

  /**
   * Initialize analyzer with paths
   */
  initialize(projectPath, ibmStandardsPath, outputPath) {
    this.projectPath = path.resolve(projectPath);
    this.ibmStandardsPath = path.resolve(ibmStandardsPath || path.join(__dirname, '../../ibm-standards'));
    this.outputPath = path.resolve(outputPath || path.join(this.projectPath, 'modernization-report.json'));

    console.log('\n🔍 IBM Code Analyzer v1.0.0');
    console.log('================================\n');
    console.log(`📁 Project Path: ${this.projectPath}`);
    console.log(`📋 IBM Standards: ${this.ibmStandardsPath}`);
    console.log(`📄 Output: ${this.outputPath}\n`);
  }

  /**
   * Run complete analysis
   */
  async analyze() {
    try {
      console.log('🚀 Starting analysis...\n');

      // Step 1: Analyze dependencies
      console.log('📦 Step 1: Analyzing dependencies...');
      const dependencyAnalyzer = new DependencyAnalyzer(this.ibmStandardsPath);
      const dependencyAnalysis = dependencyAnalyzer.analyzeDependencies(this.projectPath);
      console.log(`   ✓ Found ${dependencyAnalysis.totalDependencies} dependencies`);
      console.log(`   ✓ Detected ${dependencyAnalysis.issues.length} issues\n`);

      // Step 2: Detect legacy patterns
      console.log('🔎 Step 2: Detecting legacy code patterns...');
      const patternDetector = new PatternDetector();
      const patternAnalysis = await patternDetector.analyzeProject(this.projectPath);
      console.log(`   ✓ Analyzed ${patternAnalysis.filesAnalyzed} files`);
      console.log(`   ✓ Detected ${patternAnalysis.patterns.length} pattern issues\n`);

      // Step 3: Generate modernization rules
      console.log('📝 Step 3: Generating modernization rules...');
      const ruleGenerator = new RuleGenerator();
      const projectName = path.basename(this.projectPath);
      const rules = ruleGenerator.generateRules(dependencyAnalysis, patternAnalysis, projectName);
      console.log(`   ✓ Generated ${rules.summary.totalRules} rules`);
      console.log(`   ✓ Created ${rules.aiPrompts.length} AI prompts\n`);

      // Step 4: Generate comprehensive report
      console.log('📊 Step 4: Generating report...');
      const report = this.generateReport(dependencyAnalysis, patternAnalysis, rules);
      
      // Save report
      this.saveReport(report);
      console.log(`   ✓ Report saved to: ${this.outputPath}\n`);

      // Display summary
      this.displaySummary(report);

      return report;
    } catch (error) {
      console.error('\n❌ Analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport(dependencyAnalysis, patternAnalysis, rules) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        analyzer: 'IBM Code Analyzer v1.0.0',
        project: path.basename(this.projectPath),
        projectPath: this.projectPath
      },
      summary: {
        totalIssues: dependencyAnalysis.issues.length + patternAnalysis.patterns.length,
        dependencies: dependencyAnalysis.summary,
        patterns: patternAnalysis.summary,
        rules: rules.summary
      },
      dependencyAnalysis: {
        totalDependencies: dependencyAnalysis.totalDependencies,
        issues: dependencyAnalysis.issues,
        recommendations: dependencyAnalysis.recommendations
      },
      patternAnalysis: {
        filesAnalyzed: patternAnalysis.filesAnalyzed,
        patterns: patternAnalysis.patterns,
        fileResults: patternAnalysis.fileResults
      },
      modernizationRules: {
        dependencyRules: rules.dependencyRules,
        patternRules: rules.patternRules,
        aiPrompts: rules.aiPrompts
      },
      recommendations: this.generateRecommendations(rules)
    };
  }

  /**
   * Generate prioritized recommendations
   */
  generateRecommendations(rules) {
    const allRules = [...rules.dependencyRules, ...rules.patternRules];
    
    // Sort by priority and severity
    const sortedRules = allRules.sort((a, b) => {
      const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    return {
      immediate: sortedRules.filter(r => r.severity === 'critical').slice(0, 5),
      highPriority: sortedRules.filter(r => r.severity === 'error').slice(0, 10),
      medium: sortedRules.filter(r => r.severity === 'warning').slice(0, 10),
      low: sortedRules.filter(r => r.severity === 'info').slice(0, 10)
    };
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));

    // Also save a human-readable markdown version
    const mdPath = this.outputPath.replace('.json', '.md');
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(mdPath, markdown);
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    return `# Code Modernization Report

**Generated:** ${new Date(report.metadata.generatedAt).toLocaleString()}  
**Project:** ${report.metadata.project}  
**Analyzer:** ${report.metadata.analyzer}

---

## Executive Summary

- **Total Issues Found:** ${report.summary.totalIssues}
- **Dependency Issues:** ${report.dependencyAnalysis.issues.length}
- **Code Pattern Issues:** ${report.patternAnalysis.patterns.length}
- **Files Analyzed:** ${report.patternAnalysis.filesAnalyzed}

### Issues by Severity

- 🔴 **Critical:** ${report.summary.rules.bySeverity.critical}
- ⚠️ **Error:** ${report.summary.rules.bySeverity.error}
- ⚡ **Warning:** ${report.summary.rules.bySeverity.warning}
- ℹ️ **Info:** ${report.summary.rules.bySeverity.info}

### Estimated Effort

**Overall Effort:** ${report.summary.rules.estimatedEffort.toUpperCase()}

---

## Immediate Actions Required

${report.recommendations.immediate.map((r, i) => `
### ${i + 1}. ${r.message}

- **Severity:** ${r.severity}
- **Category:** ${r.category}
- **Legacy Pattern:** \`${r.legacy_pattern}\`
- **Modern Replacement:** \`${r.modern_replacement}\`

**Example:**
\`\`\`javascript
// Before
${r.examples?.before || 'N/A'}

// After
${r.examples?.after || 'N/A'}
\`\`\`
`).join('\n')}

---

## Dependency Issues

### Deprecated Packages (${report.summary.dependencies.deprecated})

${report.dependencyAnalysis.issues
  .filter(i => i.type === 'deprecated')
  .map(i => `- **${i.package}** (${i.currentVersion}) → Replace with **${i.alternative}**\n  - Reason: ${i.reason}`)
  .join('\n')}

### Outdated Packages (${report.summary.dependencies.outdated})

${report.dependencyAnalysis.issues
  .filter(i => i.type === 'outdated')
  .map(i => `- **${i.package}** (${i.currentVersion}) → Update to **${i.recommendedVersion}**`)
  .join('\n')}

### Security Vulnerabilities (${report.summary.dependencies.securityVulnerabilities})

${report.dependencyAnalysis.issues
  .filter(i => i.type === 'security')
  .map(i => `- **${i.package}** - ${i.cve}\n  - Severity: ${i.severity}\n  - ${i.description}`)
  .join('\n')}

---

## Code Pattern Issues

${Object.entries(report.patternAnalysis.summary.byCategory || {}).map(([category, count]) => `
### ${category} (${count} issues)

${report.patternAnalysis.patterns
  .filter(p => p.category === category)
  .slice(0, 5)
  .map(p => `- **${p.id}**: ${p.message}\n  - Occurrences: ${p.matchCount}\n  - File: ${p.file}`)
  .join('\n')}
`).join('\n')}

---

## AI Migration Prompts

${report.modernizationRules.aiPrompts.map((prompt, i) => `
### ${i + 1}. ${prompt.id}

**Type:** ${prompt.type}  
**Priority:** ${prompt.priority}

${prompt.prompt}
`).join('\n')}

---

## Next Steps

1. Review immediate actions and address critical issues
2. Update dependencies to IBM-approved versions
3. Run automated migration tools where applicable
4. Refactor code patterns systematically
5. Run comprehensive testing
6. Update documentation

---

**For detailed JSON report, see:** ${path.basename(this.outputPath)}
`;
  }

  /**
   * Display summary in console
   */
  displaySummary(report) {
    console.log('═══════════════════════════════════════');
    console.log('           ANALYSIS SUMMARY            ');
    console.log('═══════════════════════════════════════\n');

    console.log(`📊 Total Issues: ${report.summary.totalIssues}`);
    console.log(`   • Dependency Issues: ${report.dependencyAnalysis.issues.length}`);
    console.log(`   • Code Pattern Issues: ${report.patternAnalysis.patterns.length}\n`);

    console.log('🎯 By Severity:');
    console.log(`   🔴 Critical: ${report.summary.rules.bySeverity.critical}`);
    console.log(`   ⚠️  Error: ${report.summary.rules.bySeverity.error}`);
    console.log(`   ⚡ Warning: ${report.summary.rules.bySeverity.warning}`);
    console.log(`   ℹ️  Info: ${report.summary.rules.bySeverity.info}\n`);

    console.log(`📈 Estimated Effort: ${report.summary.rules.estimatedEffort.toUpperCase()}\n`);

    console.log('🚀 Top Recommendations:');
    report.recommendations.immediate.slice(0, 3).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.message}`);
    });

    console.log('\n═══════════════════════════════════════\n');
    console.log('✅ Analysis complete!');
    console.log(`📄 Full report: ${this.outputPath}`);
    console.log(`📝 Markdown report: ${this.outputPath.replace('.json', '.md')}\n`);
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
IBM Code Analyzer - Modernization Tool

Usage:
  node src/index.js <project-path> [options]

Arguments:
  project-path          Path to the legacy project to analyze

Options:
  --standards <path>    Path to IBM standards folder (default: ../ibm-standards)
  --output <path>       Output path for report (default: <project>/modernization-report.json)
  --help, -h           Show this help message

Examples:
  node src/index.js ../legacy-codebase
  node src/index.js ../legacy-codebase --output ./reports/analysis.json
  node src/index.js ../legacy-codebase --standards ./custom-standards
`);
    process.exit(0);
  }

  const projectPath = args[0];
  const standardsIndex = args.indexOf('--standards');
  const outputIndex = args.indexOf('--output');

  const standardsPath = standardsIndex !== -1 ? args[standardsIndex + 1] : null;
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  const analyzer = new CodeAnalyzer();
  analyzer.initialize(projectPath, standardsPath, outputPath);
  
  try {
    await analyzer.analyze();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CodeAnalyzer };

// Made with Bob
