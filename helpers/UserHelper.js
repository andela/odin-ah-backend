import db from '../models';

const { User } = db;


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
    const {
      username, email, firstName, lastName, bio, imageUrl
    } = request.body;
    const updateFields = {};
    if (username) {
      updateFields.username = username;
    }
    if (email) {
      updateFields.email = email;
    }
    if (firstName) {
      updateFields.firstName = firstName;
    }
    if (lastName) {
      updateFields.lastName = lastName;
    }
    if (bio) {
      updateFields.bio = bio;
    }
    if (imageUrl) {
      updateFields.imageUrl = imageUrl;
    }
    return updateFields;
  }

  /**
   *
   * @param {User} user
   * @return {object} return user's profile
   */
  static getUserProfileData(user) {
    const {
      id, firstName, lastName, username, email, bio, imageUrl
    } = user.dataValues;
    return {
      id, firstName, lastName, username, email, bio, imageUrl
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
}

export default UserHelper;
