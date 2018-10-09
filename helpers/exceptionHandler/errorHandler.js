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
  if (error instanceof ValidationError) {
    errors = error.messages;
  }
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'An error occured',
    errors,
  });
};
export default errorHandler;
