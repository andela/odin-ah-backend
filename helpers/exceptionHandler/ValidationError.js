
/**
 *
 *
 * @class ValidationError
 */
class ValidationError extends Error {
  /**
   *Creates an instance of ValidationError.
   * @param {*} errors
   * @memberof ValidationError
   */
  constructor(errors) {
    super();
    this.status = 400;
    this.message = 'Validation error';
    this.messages = errors;
  }
}

export default ValidationError;
