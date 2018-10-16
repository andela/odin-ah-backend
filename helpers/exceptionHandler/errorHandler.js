import ValidationError from './ValidationError';

/**
 * Handles operational and some programmer errors
 * @param  {object} error - Error object
 * @param  {object} req - Request object
 * @param  {object} res - Response object
 * @param {next} next
 * @return {json} res.json
 */

const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  let { errors } = error;
  let errorCode = null;
  if (error instanceof ValidationError) {
    errors = error.messages;
  }
  if (error.code) {
    errorCode = error.code;
  }

  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'An error occurred',
    errors,
    errorCode,
  });
};
export default errorHandler;
