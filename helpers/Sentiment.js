import ToneAnalyzerV3 from 'watson-developer-cloud/tone-analyzer/v3';
import config from '../config';

/**
 * Util class for analysing the text of an article.
 */
class Sentiment {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @private
     * @type {ToneAnalyzerV3}
     */
    this.toneAnalyzer = new ToneAnalyzerV3(config.toneAnalyzerConfig);
  }

  /**
   *
   * @param {string} text
   * @return {Promise<any>} returns the of the sentiment analysis as a promise.
   * @memberOf Sentiment
   */
  analyzer(text) {
    return new Promise((resolve, reject) => {
      this.toneAnalyzer.tone({
        tone_input: text,
        content_type: 'text/plain'
      },
      (err, tone) => {
        if (err) {
          reject(err);
        } else {
          resolve(tone);
        }
      });
    });
  }
}

const sentiment = new Sentiment();
export default sentiment;
