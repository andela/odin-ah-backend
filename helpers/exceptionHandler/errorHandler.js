/**
 * Handles operational and some programmer errors
 * @param  {object} error - Error object
 * @param  {object} req - Request object
 * @param  {object} res - Response object
 * @return {json} res.json
 */

const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(error.status || 500).json({
    errors: {
      message: error.message,
      error: {}
    }
  });
};
export default errorHandler;
