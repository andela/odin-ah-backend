/**
 * Error Wrapper.
 */
export default class HttpError extends Error {
  /**
   *
   * @param {string} message
   * @param {number}[status]
   */
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }

  /**
   *
   * @param {object} data
   * @param {string} message
   * @return {void} Throws an error if data is equal to null.
   * @throws HttpError
   */
  static throw404ErrorIfNull(data, message) {
    if (!data) {
      throw new HttpError(message, 404);
    }
  }
}
