/**
 * @exports
 * @class SearchQuerySanitizer
 * @description Sanitizes search query parameters
 *
 */
class SearchQuerySanitizer {
  /**
   * Validates search query parameters
   * @param  {object} req - Request object
   * @param  {object} res - Response object
   * @param  {function} next - Next() function
   * @return {Array} errors
   * @static
   */
  static sanitize(req, res, next) {
    let {
      limit, page, author, tag
    } = req.query;
    limit = limit && !Number.isNaN(parseInt(limit, 10)) ? limit : 10;
    page = page && !Number.isNaN(parseInt(page, 10)) ? page : 1;
    author = author && !Number.isNaN(parseInt(author, 10)) ? author : null;
    tag = tag && !Number.isNaN(parseInt(tag, 10)) ? tag : null;
    req.sanitizedQuery = {
      limit,
      page,
      author,
      tag
    };
    next();
  }
}

export default SearchQuerySanitizer;
