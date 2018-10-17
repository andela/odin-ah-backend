import sentiment from '../../helpers/Sentiment';
import ValidatorHelper from '../../helpers/ValidatorHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';

/**
 * Controller for sentiment analysis
 */
export default class SentimentController {
  /**
   *
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {*} returns json response or next the
   */
  static async analyse(req, res, next) {
    try {
      const { text } = req.body;
      if (ValidatorHelper.isEmpty(text)) {
        HttpError.throwErrorIfNull(null, '', 400);
      }
      const result = await sentiment.analyzer(text);
      return res.status(200).json({ result });
    } catch (e) {
      return next(e);
    }
  }
}
