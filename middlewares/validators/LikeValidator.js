/**
 *
 *
 * @export
 * @class LikeValidator
 */
export default class LikeValidator {
  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} Returns response message
   * @memberof LikeValidator
   */
  static addLikeValidator(req, res, next) {
    const { status } = req.params;
    if (status === 'like' || status === 'dislike' || status === 'neutral') {
      return next();
    }
    return res.status(400).json({
      status: 'error',
      message: 'status can only be either like, dislike or neutral '
    });
  }
}
