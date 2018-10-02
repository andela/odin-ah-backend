
/**
 * @exports PageValidator
 * @class PageValidator
 * @description Handles validation for pagination queries
 * */
class PageValidator {
  /**
   * Validates user input values
   * @param  {req} req - Request object
   * @param {res} res - Request object
   * @param {next} next - calls next middleware
   * @return {res} Returns response message
   * @static
   */
  static validate(req, res, next) {
    const { page, size } = req.query;
    let message = '';
    const pageNum = Number(page);
    if (page && Number.isNaN(pageNum)) {
      message = 'page must be a number';
    }
    if (page && !Number.isNaN(pageNum) && pageNum < 0) {
      message = 'page must be a positive number';
    }
    const sizeNum = Number(size);
    if (size && Number.isNaN(sizeNum)) {
      message = 'size must be a number';
    }
    if (size && !Number.isNaN(sizeNum) && sizeNum < 0) {
      message = 'size must be a positive number';
    }
    if (message) {
      return res.status(400)
        .json({
          status: 'error',
          message,
        });
    }
    return next();
  }
}
export default PageValidator;
