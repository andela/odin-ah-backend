import assert from 'assert';

/**
 * @exports
 * @class SearchQueryValidator
 * @description Validates search query parameters
 *
 */
class SearchQueryValidator {
  /**
   * Validates search query parameters
   * @param  {object} req - Request object
   * @param  {object} res - Response object
   * @param  {function} next - Next() function
   * @return {Array} errors
   * @static
   */
  static validate(req, res, next) {
    try {
      const { q: query } = req.query;
      assert(query && query.trim(), 'Please supply a search query');
      next();
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

export default SearchQueryValidator;
