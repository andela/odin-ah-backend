import urlSlug from 'url-slug';

/**
 * Util class
 */
export default class Util {
  /**
   *
   * @param {string}username
   * @param {string}title
   * @return {string} Return a slug value of the provided username and tite
   */
  static createSlug(username, title) {
    return `${username}-${urlSlug(title)}`;
  }
}
