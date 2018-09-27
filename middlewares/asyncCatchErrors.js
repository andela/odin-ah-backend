/**
 * @exports asyncCatchErrors
 * @description This chains a catch method to a function and calls the next error handler
 *
 * */

const asyncCatchErrors = fn => (req, res, next) => fn(req, res, next).catch(next);
export default asyncCatchErrors;
