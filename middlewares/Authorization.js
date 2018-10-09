import jwt, { TokenExpiredError } from 'jsonwebtoken';
import ValidatorHelper from '../helpers/ValidatorHelper';

/**
 * @exports
 * @class Authorization
 * @description Protects route and handles token
 *  */
class Authorization {
  /**
     * Get the token from the request
     * @param  {object} req - Request object
     * @return {string} Returns the user token
     * @static
     */
  static getToken(req) {
    const bearerHeader = req.headers.authorization;
    if (!ValidatorHelper.isEmpty(bearerHeader)) {
      const bearer = bearerHeader.split(' ');
      return bearer[1];
    }
    return null;
  }

  /**
     * Verifies the user token
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @param {function} next - calls the next middleware
     * @return {json} Returns json object
     * @static
     */
  static verifyToken(req, res, next) {
    const token = Authorization.getToken(req);
    let error = null;
    try {
      if (token) {
        req.authData = jwt.verify(token, process.env.JWTSECRET);
      } else {
        error = {
          status: 'error',
          message: 'Token not provided',
        };
      }
    } catch (err) {
      error = Authorization.getError(err);
    }
    if (!error) {
      return next();
    }
    return res.status(401).json(error);
  }

  /**
     *
     * @param {error} err JWT error
     * @return {{message: string, status: string}} returns formatted error
     */
  static getError(err) {
    let message = 'Invalid token';
    if (err instanceof TokenExpiredError) {
      message = 'Access Token has Expired.';
    }
    return {
      message,
      status: 'error',
    };
  }

  /**
     * Generate a user Token
     * @param  {string} userId - The user id
     * @return {string} Returns json object
     * @static
     */
  static generateToken(userId) {
    return jwt.sign({
      userId
    },
    process.env.JWTSECRET, {
      expiresIn: '24h',
    });
  }

  /**
     * Verifies the user token
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @param {function} next - calls the next middleware
     * @return {object} return an object
     * @static
     */
  static secureRoutes(req, res, next) {
    if (Authorization.isAuthNotRequired(req)) {
      return next();
    }

    return Authorization.verifyToken(req, res, next);
  }

  /**
     *
     * @param {request} req
     * @return {boolean} checks if authentication is not required for the request.
     */
  static isAuthNotRequired(req) {
    const { url, method } = req;
    return url.startsWith('/auth')
            || (url.startsWith('/articles') && method.toUpperCase() === 'GET')
            || url.startsWith('/users');
  }
}

export default Authorization;
