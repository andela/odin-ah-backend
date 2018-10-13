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

    HttpError.throwErrorIfNull(userResultById, 'User not found!');

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
   *
   * @static
   * @param {request} req
   * @param {response} res
   * @param {function} next
   * @returns {object} returns profile for a specific user
   * @memberof UserProfile
   */
  static async getProfileById(req, res, next) {
    const id = req.params.id || req.authData.userId;
    try {
      const user = await User.findById(id);
      HttpError.throwErrorIfNull(user, 'User not found');
      const profile = UserHelper.profileListResponse(user);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved user profile!',
        profile
      });
    } catch (error) {
      next(error);
    }
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
    HttpError.throwErrorIfNull(count, `You were not following ${follower.username}`);
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

  /**
   *
   *
   * @static
   * @param {request} req
   * @param {response} res
   * @param {function} next
   * @returns {object} return a json response
   * @memberof UserProfile
   */
  static async getAllProfile(req, res, next) {
    try {
      const { userId } = req.authData;
      const profilesCount = await User.count({
        where: {
          id: {
            $not: userId
          }
        }
      });
      const {
        page,
        limit,
        offset
      } = Util.getPageInfo(req.query.page, req.query.size, profilesCount);
      const authorsData = await User.findAll({
        where: {
          id: {
            $not: userId
          }
        },
        limit,
        offset
      });
      if (authorsData) {
        const authors = UserHelper.profileListArrayResponse(authorsData);
        return res.status(200).json({
          status: 'success',
          message: 'Successfully retrieved list of authors.',
          data: {
            total: profilesCount,
            size: authorsData.length,
            page,
            authors,
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
export default ProfileController;
