import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import Util from '../../helpers/Util';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Follows, User } = db;
/**
 * @exports ProfileController
 * @class ProfileController
 * @description Handles the user information
 * */
class ProfileController {
  /**
     *
     * @param {request} request HTTP request
     * @param {response} response HTTP response
     * @param {response} next HTTP next response
     * @return {object} return response to user
     */
  static async updateProfile(request, response) {
    // fetch user details from authData.
    const { userId } = request.authData;
    const { email } = request.body;

    const [userResultById, userResultByEmail] = await Promise.all([
      UserHelper.findById(userId), UserHelper.findByEmail(email)
    ]);

    HttpError.throw404ErrorIfNull(userResultById, 'User not found!');

    if (UserHelper.notSameUser(userResultById, userResultByEmail)) {
      return response.status(409)
        .json({ message: 'This Email already exists, choose another email' });
    }
    const updateFields = UserHelper.getUpdateFields(request);
    const updatedUser = await userResultById.update(updateFields, {
      where: { id: userId }
    });
    const data = UserHelper.getUserProfileData(updatedUser);
    return response.status(200)
      .json({
        message: 'Profile Updated Successfully!',
        data
      });
  }

  /**
     *
     * @param {request} request HTTP request
     * @param {response} response HTTP response
     * @param {response} next HTTP next response
     * @return {object} return response to user
     */
  static async getProfile(request, response) {
    const { userId } = request.authData;
    const user = await User.findById(userId);
    HttpError.throw404ErrorIfNull(user, 'User is not found');
    const { dataValues } = user;
    return response.status(200)
      .json({
        profile: {
          email: dataValues.email,
          username: dataValues.username,
          firstName: dataValues.firstName,
          lastName: dataValues.lastName,
          bio: dataValues.bio,
          imageUrl: dataValues.imageUrl,
          createdAt: dataValues.createdAt,
          updatedAt: dataValues.updatedAt
        },
        message: 'Successful!',
      });
  }

  /**
     * Follow  other users in the application
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static async follow(req, res) {
    const { follower, id } = req.data;
    const { count } = await Follows.findAndCountAll({
      where: {
        follower: id,
        following: follower.id
      }
    });
    if (count) {
      return res.status(409).json({
        status: 'error',
        message: `You are already following ${follower.username}`
      });
    }
    const response = await Follows.create({
      follower: id,
      following: follower.id,
    });
    if (response) {
      return res.status(200).json({
        status: 'success',
        message: `You are now following ${follower.username}`
      });
    }
  }

  /**
     * unfollow a users in the application
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static async unfollow(req, res) {
    const { follower, id } = req.data;
    const { count } = await Follows.findAndCountAll({
      where: {
        follower: id,
        following: follower.id
      }
    });
    HttpError.throw404ErrorIfNull(count, `You were not following ${follower.username}`);
    const response = await Follows.destroy({
      where: {
        follower: id,
        following: follower.id
      }
    });
    if (response) {
      return res.status(200).json({
        status: 'success',
        message: `You have unfollowing ${follower.username}`
      });
    }
  }

  /**
     * Get the Users that I follow
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static async getUsersIFollow(req, res) {
    const { userId } = req.authData;
    let users = await Follows.findAll({ where: { follower: userId } });
    if (users.length === 0) {
      return res.status(200).json({ status: 'error', message: 'You are not following anyone yet' });
    }
    const id = users.map(user => user.following);
    const total = id.length;
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { page, limit, offset } = pageInfo;
    users = await User.findAll({
      limit,
      offset,
      where: {
        id
      }
    });
    const usersIFollow = users.map(user => ({ userId: user.id, username: user.username }));
    return res.status(200).json({
      data: {
        usersIFollow,
        page,
        total,
      }
    });
  }

  /**
     * Get users following me
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static async getMyFollowers(req, res) {
    const { userId } = req.authData;
    let users = await Follows.findAll({ where: { following: userId } });
    if (users.length === 0) {
      return res.status(200).json({ status: 'error', message: 'You do not have followers yet' });
    }
    const id = users.map(user => user.follower);
    const total = id.length;
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { page, limit, offset } = pageInfo;
    users = await User.findAll({
      limit,
      offset,
      where: {
        id
      }
    });
    const myFollowers = users.map(user => ({ userId: user.id, username: user.username }));
    return res.status(200).json({
      data: {
        myFollowers,
        page,
        total,
      }
    });
  }
}
export default ProfileController;
