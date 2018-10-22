import HttpError from '../../helpers/exceptionHandler/httpError';

/**
 *
 * @export
 * @class ReportValidator
 */
export default class ReportValidator {
  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {res} Returns response message
   * @memberof ReportValidator
   */
  static reportArticleValidator(req, res, next) {
    const { reportType, description } = req.body;
    let message = null;
    HttpError.throwErrorIfNull(reportType, 'reportType can not be empty', 400);
    HttpError.throwErrorIfNull(description, 'Description can not be empty', 400);

    if (!reportType || !ReportValidator.isTypeValid(reportType)) {
      message = 'reportType can only be either plagiarism, spam, harassment or other ';
    }
    if (message) {
      return next(new HttpError(message, 400));
    }
    return next(

    );
  }

  /**
     *
     * @param { 'plagiarism' |'spam' | 'harassment' | 'others'  } reportType
     * @return {boolean} checks if reportType is valid.
     */
  static isTypeValid(reportType) {
    return reportType === 'plagiarism' || reportType === 'spam' || reportType === 'harassment' || reportType === 'others';
  }
}
