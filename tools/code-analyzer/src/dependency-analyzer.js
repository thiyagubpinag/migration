import fs from 'fs';
import path from 'path';
import semver from 'semver';

/**
 * Analyzes package.json dependencies against IBM standards
 */
export class DependencyAnalyzer {
  constructor(ibmStandardsPath) {
    this.ibmStandards = this.loadIBMStandards(ibmStandardsPath);
  }

  /**
   * Load IBM approved packages standards
   */
  loadIBMStandards(standardsPath) {
    try {
      const standardsFile = path.join(standardsPath, 'ibm-approved-packages.json');
      const data = fs.readFileSync(standardsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading IBM standards:', error.message);
      throw error;
    }
  }

  /**
   * Analyze package.json from legacy project
   */
  analyzeDependencies(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found at ${packageJsonPath}`);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const issues = [];
    const recommendations = [];

    for (const [packageName, version] of Object.entries(dependencies)) {
      const cleanVersion = version.replace(/^[\^~]/, '');
      
      // Check if package is deprecated
      if (this.ibmStandards.deprecatedPackages[packageName]) {
        const deprecatedInfo = this.ibmStandards.deprecatedPackages[packageName];
        issues.push({
          type: 'deprecated',
          package: packageName,
          currentVersion: version,
          status: deprecatedInfo.status,
          reason: deprecatedInfo.reason,
          alternative: deprecatedInfo.modernAlternative,
          severity: 'high'
        });

        recommendations.push({
          package: packageName,
          action: 'replace',
          with: deprecatedInfo.modernAlternative,
          reason: deprecatedInfo.reason
        });
      }
      // Check if package version is outdated
      else if (this.ibmStandards.approvedPackages[packageName]) {
        const approvedInfo = this.ibmStandards.approvedPackages[packageName];
        const minVersion = approvedInfo.minVersion;
        
        if (semver.valid(cleanVersion) && semver.valid(minVersion)) {
          if (semver.lt(cleanVersion, minVersion)) {
            issues.push({
              type: 'outdated',
              package: packageName,
              currentVersion: version,
              minVersion: approvedInfo.minVersion,
              recommendedVersion: approvedInfo.recommendedVersion,
              severity: 'medium'
            });

            recommendations.push({
              package: packageName,
              action: 'update',
              from: version,
              to: approvedInfo.recommendedVersion,
              reason: `Update to IBM-approved version (min: ${minVersion})`
            });
          }
        }
      }
      // Package not in IBM standards
      else {
        issues.push({
          type: 'not-approved',
          package: packageName,
          currentVersion: version,
          severity: 'low',
          note: 'Package not in IBM approved list - review required'
        });
      }
    }

    // Check for security vulnerabilities
    const securityIssues = this.checkSecurityVulnerabilities(dependencies);
    issues.push(...securityIssues);

    return {
      totalDependencies: Object.keys(dependencies).length,
      issues,
      recommendations,
      summary: {
        deprecated: issues.filter(i => i.type === 'deprecated').length,
        outdated: issues.filter(i => i.type === 'outdated').length,
        notApproved: issues.filter(i => i.type === 'not-approved').length,
        securityVulnerabilities: issues.filter(i => i.type === 'security').length
      }
    };
  }

  /**
   * Check for known security vulnerabilities
   */
  checkSecurityVulnerabilities(dependencies) {
    const vulnerabilities = [];

    for (const alert of this.ibmStandards.securityAlerts) {
      if (dependencies[alert.package]) {
        const version = dependencies[alert.package].replace(/^[\^~]/, '');
        
        if (semver.valid(version) && semver.satisfies(version, alert.affectedVersions)) {
          vulnerabilities.push({
            type: 'security',
            package: alert.package,
            currentVersion: dependencies[alert.package],
            severity: alert.severity,
            cve: alert.cve,
            description: alert.description,
            affectedVersions: alert.affectedVersions
          });
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * Generate modernization rules for dependencies
   */
  generateDependencyRules(analysisResult) {
    const rules = [];

    for (const issue of analysisResult.issues) {
      if (issue.type === 'deprecated') {
        rules.push({
          id: `dep-${issue.package}-deprecated`,
          category: 'dependency-modernization',
          severity: 'error',
          legacy_pattern: `"${issue.package}": "${issue.currentVersion}"`,
          modern_replacement: issue.alternative,
          message: `Package "${issue.package}" is ${issue.status}. ${issue.reason}`,
          recommendation: `Replace with ${issue.alternative}`,
          examples: {
            before: `const ${issue.package} = require('${issue.package}');`,
            after: this.getReplacementExample(issue.package, issue.alternative)
          }
        });
      } else if (issue.type === 'outdated') {
        rules.push({
          id: `dep-${issue.package}-outdated`,
          category: 'dependency-update',
          severity: 'warning',
          legacy_pattern: `"${issue.package}": "${issue.currentVersion}"`,
          modern_replacement: `"${issue.package}": "^${issue.recommendedVersion}"`,
          message: `Package "${issue.package}" version ${issue.currentVersion} is outdated. Minimum required: ${issue.minVersion}`,
          recommendation: `Update to version ${issue.recommendedVersion}`,
          examples: {
            before: `"${issue.package}": "${issue.currentVersion}"`,
            after: `"${issue.package}": "^${issue.recommendedVersion}"`
          }
        });
      } else if (issue.type === 'security') {
        rules.push({
          id: `sec-${issue.package}-${issue.cve}`,
          category: 'security-vulnerability',
          severity: 'critical',
          legacy_pattern: `"${issue.package}": "${issue.currentVersion}"`,
          modern_replacement: 'Update to latest secure version',
          message: `Security vulnerability ${issue.cve} in ${issue.package}. ${issue.description}`,
          recommendation: `Update immediately to a version not affected by ${issue.cve}`,
          cve: issue.cve,
          affectedVersions: issue.affectedVersions
        });
      }
    }

    return rules;
  }

  /**
   * Get replacement example for deprecated packages
   */
  getReplacementExample(oldPackage, newPackage) {
    const examples = {
      'request': 'const axios = require(\'axios\'); // or import axios from \'axios\';',
      'async': 'Use native async/await syntax',
      'q': 'Use native Promise API',
      'bluebird': 'Use native Promise API',
      'underscore': 'const _ = require(\'lodash\'); // or use native array methods',
      'moment': 'const { format, parseISO } = require(\'date-fns\');',
      'gulp': 'Use npm scripts in package.json',
      'grunt': 'Use npm scripts in package.json'
    };

    return examples[oldPackage] || `const ${newPackage} = require('${newPackage}');`;
  }
}

// Made with Bob
