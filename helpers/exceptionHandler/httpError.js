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
     * @param {object} data - The object to test.
     * @param {string} message - The error message to return to the user
     * @param {number} [status] - The status to return to the user
     * @return {void} Throws an error if data is equal to null.
     * @throws HttpError
     */
  static throwErrorIfNull(data, message, status = 404) {
    if (!data) {
      throw new HttpError(message, status);
    }
  }
}
