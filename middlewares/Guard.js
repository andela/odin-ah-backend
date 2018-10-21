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
    this.role = '';
  }

  /**
   *
   *
   * @param {string} role
   * @returns {function} calls next function if action is allowed
   * @memberof Guard
   */
  allow(role) {
    return (req, res, next) => {
      this.role = role;
      if (!req.authData || req.authData.role !== this.role) {
        const error = new HttpError('You are not authorized to access this resource', 401);
        return next(error);
      }
      next();
    };
  }
}

export default new Guard();
