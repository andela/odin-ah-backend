
/**
 *
 *
 * @class ValidationError
 */
class ValidationError {
  /**
   *Creates an instance of ValidationError.
   * @param {*} errors
   * @memberof ValidationError
   */
  constructor(errors) {
    this.status = 400;
    this.message = 'Validation error';
    this.messages = errors;
  }
}

export default ValidationError;
