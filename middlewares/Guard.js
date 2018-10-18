import HttpError from '../helpers/exceptionHandler/httpError';

/**
 *
 *
 * @class Guard
 */
class Guard {
  /**
   *Creates an instance of Guard.
   * @memberof Guard
   */
  constructor() {
    this.roles = ['user', 'admin', 'superadmin'];
  }

  /**
   *
   *
   * @param {string} role
   * @returns {boolean} returns true if role exists
   * @memberof Guard
   */
  exists(role) {
    return this.roles.indexOf(role) > -1;
  }

  /**
   *
   *
   * @param {string} role
   * @returns {function} calls next funtion if action is allowed
   * @memberof Guard
   */
  allow(role) {
    return (req, res, next) => {
      if (!this.exists(role)) {
        const error = new HttpError('User role doesn\'t exist', 400);
        return next(error);
      }
      if (!req.authData || req.authData.role !== role) {
        const error = new HttpError('You are not authorized to access this resource', 401);
        return next(error);
      }
      next();
    };
  }
}

export default new Guard();
