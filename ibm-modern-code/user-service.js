/**
 * IBM-Approved Modern User Service
 * Follows IBM best practices and modern JavaScript standards
 */

import { EventEmitter } from 'events';
import { validateUserData, validateUpdateData } from './validators.js';
import { UserNotFoundError, ValidationError } from './errors.js';

/**
 * Modern User Service implementing IBM standards
 * - Uses ES6+ features (const, let, arrow functions, classes)
 * - Promise-based async operations
 * - Proper error handling
 * - Input validation
 * - Event-driven architecture
 * - Comprehensive logging
 */
export class UserService extends EventEmitter {
  constructor(logger, config = {}) {
    super();
    this.users = new Map();
    this.userIdCounter = 1;
    this.logger = logger;
    this.config = {
      maxUsers: config.maxUsers || 10000,
      enableAudit: config.enableAudit !== false,
      ...config
    };
  }

  /**
   * Get user by ID with proper error handling
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   * @throws {UserNotFoundError} If user doesn't exist
   */
  async getUserById(id) {
    this.logger.debug(`Fetching user with ID: ${id}`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.get(id);
        
        if (!user) {
          const error = new UserNotFoundError(`User with ID ${id} not found`);
          this.logger.warn(error.message);
          reject(error);
          return;
        }
        
        this.logger.info(`User ${id} retrieved successfully`);
        resolve({ ...user }); // Return copy to prevent mutation
      }, 10);
    });
  }

  /**
   * Create new user with validation
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   * @throws {ValidationError} If validation fails
   */
  async createUser(userData) {
    this.logger.debug('Creating new user', { email: userData.email });

    // Validate input
    const validation = validateUserData(userData);
    if (!validation.valid) {
      const error = new ValidationError('Invalid user data', validation.errors);
      this.logger.error('User creation failed', { errors: validation.errors });
      throw error;
    }

    // Check capacity
    if (this.users.size >= this.config.maxUsers) {
      throw new Error('Maximum user capacity reached');
    }

    const newUser = {
      id: this.userIdCounter++,
      name: userData.name,
      email: userData.email.toLowerCase(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(newUser.id, newUser);
    
    // Emit event for audit trail
    if (this.config.enableAudit) {
      this.emit('user:created', { userId: newUser.id, timestamp: newUser.createdAt });
    }

    this.logger.info(`User created successfully`, { userId: newUser.id });
    return { ...newUser };
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   * @throws {UserNotFoundError} If user doesn't exist
   */
  async deleteUser(id) {
    this.logger.debug(`Deleting user with ID: ${id}`);

    const user = await this.getUserById(id); // Reuse validation
    const deleted = this.users.delete(id);

    if (deleted && this.config.enableAudit) {
      this.emit('user:deleted', { userId: id, timestamp: new Date().toISOString() });
    }

    this.logger.info(`User ${id} deleted successfully`);
    return deleted;
  }

  /**
   * Update user with validation
   * @param {number} id - User ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated user
   * @throws {UserNotFoundError|ValidationError}
   */
  async updateUser(id, updates) {
    this.logger.debug(`Updating user ${id}`, { updates });

    // Validate updates
    const validation = validateUpdateData(updates);
    if (!validation.valid) {
      throw new ValidationError('Invalid update data', validation.errors);
    }

    const user = await this.getUserById(id);

    // Apply updates
    const updatedUser = {
      ...user,
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email.toLowerCase() }),
      ...(updates.status && { status: updates.status }),
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updatedUser);

    if (this.config.enableAudit) {
      this.emit('user:updated', { 
        userId: id, 
        changes: Object.keys(updates),
        timestamp: updatedUser.updatedAt 
      });
    }

    this.logger.info(`User ${id} updated successfully`);
    return { ...updatedUser };
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated users
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10 } = options;
    const users = Array.from(this.users.values());
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: users.slice(start, end),
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      }
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('UserService shutting down');
    this.removeAllListeners();
    this.users.clear();
  }
}

export default UserService;

// Made with Bob
