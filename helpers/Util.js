import urlSlug from 'url-slug';
import { DEFAULT_LIMIT } from './constants';

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

  /**
   *
   * @param {number} page
   * @param {number} size
   * @param {number} total
   * @return {object} returns information for pagination.
   */
  static getPageInfo(page, size, total) {
    const pageNumber = Number(page);
    if (!(!Number.isNaN(pageNumber) && pageNumber > 0)) {
      page = 1;
    }
    let limit;

    const sizeNumber = Number(size);
    if (!Number.isNaN(sizeNumber) && sizeNumber > 0) {
      limit = size || DEFAULT_LIMIT;
    } else {
      limit = DEFAULT_LIMIT;
    }
    let totalPages = Math.ceil(total / limit);
    if (!totalPages) totalPages = 1;
    page = Math.min(totalPages, page);

    const offset = (page - 1) * limit;
    return {
      page, limit, offset
    };
  }
}
