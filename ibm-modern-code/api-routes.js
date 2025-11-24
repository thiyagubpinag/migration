/**
 * IBM-Approved Modern API Routes
 * Implements IBM best practices for REST API design
 */

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Create modern API router with IBM standards
 * - Async/await pattern
 * - Input validation middleware
 * - Error handling middleware
 * - Rate limiting
 * - Security headers
 * - Authentication/Authorization
 * - Request logging
 * - OpenAPI documentation support
 */
export function createUserRouter(userService, logger, authMiddleware) {
  const router = express.Router();

  // Security middleware
  router.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  router.use(limiter);

  // Request logging middleware
  router.use((req, res, next) => {
    logger.info('API request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next();
  });

  /**
   * Validation middleware helper
   */
  const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  };

  /**
   * POST /users - Create new user
   * @requires authentication
   */
  router.post('/users',
    authMiddleware.requireAuth,
    [
      body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
    ],
    validate,
    async (req, res, next) => {
      try {
        const user = await userService.createUser(req.body);
        
        logger.info('User created', { userId: user.id, createdBy: req.user.id });
        
        res.status(201).json({
          success: true,
          data: user,
          message: 'User created successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * GET /users/:id - Get user by ID
   * @requires authentication
   */
  router.get('/users/:id',
    authMiddleware.requireAuth,
    [
      param('id').isInt({ min: 1 }).withMessage('Valid user ID required')
    ],
    validate,
    async (req, res, next) => {
      try {
        const userId = parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        
        res.json({
          success: true,
          data: user
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * GET /users - Get all users with pagination
   * @requires authentication
   */
  router.get('/users',
    authMiddleware.requireAuth,
    async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await userService.getAllUsers({ page, limit });
        
        res.json({
          success: true,
          ...result
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * PUT /users/:id - Update user
   * @requires authentication and authorization
   */
  router.put('/users/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireOwnershipOrAdmin('id'),
    [
      param('id').isInt({ min: 1 }).withMessage('Valid user ID required'),
      body('name').optional().trim().isLength({ min: 2, max: 100 }),
      body('email').optional().isEmail().normalizeEmail(),
      body('status').optional().isIn(['active', 'inactive'])
    ],
    validate,
    async (req, res, next) => {
      try {
        const userId = parseInt(req.params.id);
        const user = await userService.updateUser(userId, req.body);
        
        logger.info('User updated', { userId, updatedBy: req.user.id });
        
        res.json({
          success: true,
          data: user,
          message: 'User updated successfully'
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * DELETE /users/:id - Delete user
   * @requires authentication and admin role
   */
  router.delete('/users/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireRole('admin'),
    [
      param('id').isInt({ min: 1 }).withMessage('Valid user ID required')
    ],
    validate,
    async (req, res, next) => {
      try {
        const userId = parseInt(req.params.id);
        await userService.deleteUser(userId);
        
        logger.info('User deleted', { userId, deletedBy: req.user.id });
        
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Error handling middleware
   */
  router.use((error, req, res, next) => {
    logger.error('API error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    // Handle specific error types
    if (error.name === 'UserNotFoundError') {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: error.message
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (error.name === 'ForbiddenError') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  });

  return router;
}

export default createUserRouter;

// Made with Bob
