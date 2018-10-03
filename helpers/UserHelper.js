import user from '../models';
import logger from './exceptionHandler/errorHandler';

const { User } = user;


/**
 * @exports UserHelper
 * @class UserHelpers
 * @description Contains methods to assist User
 * */
class UserHelper {
  /**
   * Find a particular user  by emial
   * @async
   * @param {string} email - the user email
   * @return {object} Returns json object
   * @static
   */
  static async findByEmail(email) {
    try {
      const foundUser = await User.findOne({ where: { email } });
      if (foundUser) {
        return foundUser;
      }
      return null;
    } catch (e) {
      throw new Error('Somthing went wrong', e);
    }
  }

  /**
   * Find a particular user by id
   * @async
   * @param {number} id - the user email
   * @return {object} Returns json object
   * @static
   */
  static async findById(id) {
    let data = null;
    try {
      data = await User.findOne({ where: { id } });
    } catch (e) {
      logger.error(e);
    }
    return data;
  }
}

export default UserHelper;
