import jwt from 'jsonwebtoken';
import urlSlug from 'url-slug';
import randomstring from 'randomstring';
import { DEFAULT_LIMIT } from './constants';
import config from '../config';

/**
 * Util class
 */
export default class Util {
  /**
   *
   * @param {string}title
   * @return {string} Return a slug value of the provided title
   */
  static createSlug(title) {
    const suffix = Util.generateRandomString(8);
    return `${urlSlug(title).toLowerCase()}-${suffix}`;
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
    // checks if pageNumber is a number if and if the number is greater than zero.
    if (!(!Number.isNaN(pageNumber) && pageNumber > 0)) {
      page = 1;
    }
    let limit;

    const sizeNumber = Number(size);
    if (!Number.isNaN(sizeNumber) && sizeNumber > 0) {
      limit = size;
    } else {
      limit = DEFAULT_LIMIT;
    }
    let totalPages = Math.ceil(total / limit);
    if (!totalPages) totalPages = 1;
    page = Math.min(totalPages, page);

    const offset = (page - 1) * limit;
    return {
      page, limit, offset, totalPages
    };
  }

  /**
   *
   *
   * @static
   * @param {*} data
   * @param {*} signature
   * @returns {string} returns encoded jwt string
   * @memberof Util
   */
  static generateToken(data, signature) {
    return jwt.sign(data,
      signature, {
        expiresIn: config.passwordResetExpiry,
      });
  }

  /**
   *
   *
   * @static
   * @param {*} date
   * @returns {string} returns a string format of the timestamp
   * @memberof Util
   */
  static dateToString(date) {
    return new Date(date).getTime().toString();
  }

  /**
   *
   * @param {Array} fieldNames
   * @param {object} data
   * @return {object} Gets the fields in the array from the data object if they exist,
   * and return those field as an object
   */
  static extractFieldsFromObject(fieldNames, data) {
    const result = {};
    fieldNames.forEach((field) => {
      if (data[field]) {
        result[field] = data[field];
      }
    });
    return result;
  }

  /**
   *
   * @param {number} length
   * @return {string} returns a random alphanumeric string
   */
  static generateRandomString(length) {
    return randomstring.generate(length);
  }

  /**
   *
   * @param {User} user
   * @return {string} returns user fullname if the first and last name exist otherwise it returns
   * the username
   */
  static getFullName(user) {
    const {
      username, firstName, lastName
    } = user;
    let name = username;
    if (firstName && lastName) {
      name = `${firstName} ${lastName}`;
    }
    return name;
  }

  /**
   *
   * @param {string} tag
   * @return {string} return error message
   */
  static validateTag(tag) {
    const tagPattern = /^[a-zA-Z0-9\-\s&]{1,25}$/;

    if (tag) {
      tag = tag.trim();
    }

    if (!tag || tag.match(tagPattern)) return null;

    let message;
    if (tag.length > 25) {
      message = 'Tag must not exceed 25 characters';
    } else {
      message = 'Tag can only contain number, alphabets, space or dash [ - ]';
    }
    return message;
  }
}
