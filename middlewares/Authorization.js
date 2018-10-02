import jwt from 'jsonwebtoken';
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
      const bearerToken = bearer[1];
      return bearerToken;
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
    try {
      const token = Authorization.getToken(req);
      const authData = jwt.verify(token, process.env.JWTSECRET);
      req.authData = authData;

      return next();
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid user token'
      });
    }
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
}

export default Authorization;
