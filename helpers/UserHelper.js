import db from '../models';
import Util from './Util';

const { User } = db;


/**
 * @exports UserHelper
 * @class UserHelpers
 * @description Contains methods to assist User
 * */
class UserHelper {
  /**
     * Find a particular user  by email
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
      throw new Error('Something went wrong', e);
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
      throw new Error('Something went wrong', e);
    }
    return data;
  }

  /**
     *
     * @param {request} request HTTP request
     * @return {object} return user fields to update
     */
  static getUpdateFields(request) {
    return Util.extractFieldsFromObject(['username', 'email', 'firstName', 'lastName', 'bio', 'imageUrl', 'settings'],
      request.body);
  }

  /**
     *
     * @param {User} user
     * @return {object} return user's profile
     */
  static getUserProfileData(user) {
    const {
      id,
      firstName,
      lastName,
      username,
      email,
      bio,
      imageUrl,
      settings
    } = user.dataValues;
    return {
      id,
      firstName,
      lastName,
      username,
      email,
      bio,
      imageUrl,
      settings
    };
  }

  /**
     *
     * @param {User} userResultById
     * @param {User} userResultByEmail
     * @return {boolean} Compare two users by ids
     */
  static notSameUser(userResultById, userResultByEmail) {
    return userResultByEmail && userResultById
            && userResultById.dataValues.id !== userResultByEmail.dataValues.id;
  }

  /**
     *
     *
     * @static
     * @param {object} { username, email, firsName , lastName }
     * @returns {object} an object containing the attributes needed
     * @memberof UserHelper
     */
  static profileListResponse({
    id,
    username,
    email,
    firstName,
    lastName,
    bio,
    imageUrl,
    settings,
    createdAt,
    updatedAt
  }) {
    return {
      id,
      username,
      email,
      firstName,
      lastName,
      bio,
      imageUrl,
      settings,
      createdAt,
      updatedAt
    };
  }

  /**
     *
     *
     * @static
     * @param {array} profiles
     * @returns {array} returns object containing required response
     * @memberof UserHelper
     */
  static profileListArrayResponse(profiles) {
    return profiles.map(profile => (
      UserHelper.profileListResponse(profile)
    ));
  }
}

export default UserHelper;
