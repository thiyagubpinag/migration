/**
 * IBM-Approved Modern Database Connector
 * Implements IBM best practices for database connectivity
 */

import mysql from 'mysql2/promise';
import { EventEmitter } from 'events';

/**
 * Modern Database Connector with IBM standards
 * - Connection pooling
 * - Environment-based configuration
 * - Prepared statements
 * - Transaction support
 * - Proper error handling
 * - Graceful shutdown
 */
export class DatabaseConnector extends EventEmitter {
  constructor(config, logger) {
    super();
    this.logger = logger;
    this.config = {
      host: config.host || process.env.DB_HOST,
      port: config.port || process.env.DB_PORT || 3306,
      user: config.user || process.env.DB_USER,
      password: config.password || process.env.DB_PASSWORD,
      database: config.database || process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialize connection pool
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.logger.info('Initializing database connection pool');
      this.pool = mysql.createPool(this.config);
      
      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      
      this.isConnected = true;
      this.emit('connected');
      this.logger.info('Database connection pool initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database connection', { error: error.message });
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Execute query with prepared statements
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(query, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      this.logger.debug('Executing query', { query, paramCount: params.length });
      const [results] = await this.pool.execute(query, params);
      this.logger.debug('Query executed successfully', { rowCount: results.length || results.affectedRows });
      return results;
    } catch (error) {
      this.logger.error('Query execution failed', { 
        query, 
        error: error.message,
        code: error.code 
      });
      throw error;
    }
  }

  /**
   * Get user by email with prepared statement
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const results = await this.executeQuery(query, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create user with profile in a transaction
   * @param {Object} userData - User data
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Created user and profile IDs
   */
  async createUserWithProfile(userData, profileData) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      this.logger.debug('Transaction started for user creation');

      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, created_at) VALUES (?, ?, NOW())',
        [userData.name, userData.email]
      );
      const userId = userResult.insertId;

      // Insert profile
      const [profileResult] = await connection.execute(
        'INSERT INTO profiles (user_id, bio, avatar_url, created_at) VALUES (?, ?, ?, NOW())',
        [userId, profileData.bio, profileData.avatarUrl]
      );
      const profileId = profileResult.insertId;

      await connection.commit();
      this.logger.info('User and profile created successfully', { userId, profileId });

      return { userId, profileId };
    } catch (error) {
      await connection.rollback();
      this.logger.error('Transaction failed, rolled back', { error: error.message });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Async function receiving connection
   * @returns {Promise<any>} Transaction result
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Health check
   * @returns {Promise<boolean>} Connection health status
   */
  async healthCheck() {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get connection pool stats
   * @returns {Object} Pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalConnections: this.pool.pool._allConnections.length,
      freeConnections: this.pool.pool._freeConnections.length,
      queuedRequests: this.pool.pool._connectionQueue.length
    };
  }

  /**
   * Graceful shutdown
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.pool) {
      this.logger.info('Closing database connection pool');
      await this.pool.end();
      this.isConnected = false;
      this.emit('disconnected');
      this.logger.info('Database connection pool closed');
    }
  }
}

export default DatabaseConnector;

// Made with Bob
