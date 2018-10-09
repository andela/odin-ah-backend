/**
 * Handles operational and some programmer errors
 * @param  {object} error - Error object
 * @param  {object} req - Request object
 * @param  {object} res - Response object
 * @param {next} next
 * @return {json} res.json
 */

const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(error.status || 500).json({
    message: error.message,
    status: 'error'
  });
};
export default errorHandler;
