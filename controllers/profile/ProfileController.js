import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import Util from '../../helpers/Util';
import HttpError from '../../helpers/exceptionHandler/httpError';
import eventBus from '../../helpers/eventBus';

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
   * @return {object} return response to user
   */
  static async updateProfile(request, response) {
    // fetch user details from authData.
    const { userId } = request.authData;
    const { email } = request.body;

    const [userResultById, userResultByEmail] = await Promise.all([
      UserHelper.findById(userId),
      UserHelper.findByEmail(email)
    ]);

    HttpError.throwErrorIfNull(userResultById, 'User not found!');

    if (UserHelper.notSameUser(userResultById, userResultByEmail)) {
      return response
        .status(409)
        .json({ message: 'This Email already exists, choose another email' });
    }
    const updateFields = UserHelper.getUpdateFields(request);
    if (updateFields.settings) {
      const { settings } = userResultById;
      updateFields.settings = { ...settings, ...updateFields.settings };
    }

    const updatedUser = await userResultById.update(updateFields, {
      where: { id: userId }
    });
    const data = UserHelper.getUserProfileData(updatedUser);
    return response.status(200).json({
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
      following: follower.id
    });
    eventBus.emit('onFollowEvent', {
      toUser: response.dataValues.following,
      fromUser: response.dataValues.follower,
      type: 'follow'
    });
    return res.status(200).json({
      status: 'success',
      message: `You are now following ${follower.username}`
    });
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
    const follow = await Follows.findOne({
      where: {
        follower: id,
        following: follower.id
      }
    });
    HttpError.throwErrorIfNull(follow, `You were not following ${follower.username}`);
    await follow.destroy({ force: true });
    return res.status(200).json({
      status: 'success',
      message: `You have successfully unfollowed ${follower.username}`
    });
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
    const { id: otherUserId } = req.query;
    let whereClause = { follower: userId };
    if (otherUserId) whereClause = { follower: userId, following: otherUserId };
    let users = await Follows.findAll({ where: whereClause });
    const id = users.map(user => user.following);
    const total = id.length;
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const {
      page, limit, offset, totalPages
    } = pageInfo;
    users = await User.findAll({
      limit,
      offset,
      where: {
        id
      }
    });
    const usersIFollow = users.map(user => ({
      userId: user.id,
      username: user.username,
      bio: user.bio,
      imageUrl: user.imageUrl
    }));
    return res.status(200).json({
      data: {
        usersIFollow,
        page,
        totalPages,
        size: usersIFollow.length,
        total
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
      return res.status(200).json({
        status: 'error',
        message: 'You do not have followers yet'
      });
    }
    const id = users.map(user => user.follower);
    const total = id.length;
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const {
      page, limit, offset, totalPages
    } = pageInfo;
    users = await User.findAll({
      limit,
      offset,
      where: {
        id
      }
    });
    const myFollowers = users.map(user => ({
      userId: user.id,
      username: user.username,
      bio: user.bio,
      imageUrl: user.imageUrl
    }));
    return res.status(200).json({
      data: {
        myFollowers,
        page,
        totalPages,
        size: myFollowers.length,
        total
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
        page, limit, offset, totalPages
      } = Util.getPageInfo(
        req.query.page,
        req.query.size,
        profilesCount
      );
      const authorsData = await User.findAll({
        where: {
          id: {
            $not: userId
          }
        },
        limit,
        offset
      });
      const authors = UserHelper.profileListArrayResponse(authorsData);
      return res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved list of authors.',
        data: {
          authors,
          page,
          totalPages,
          size: authors.length,
          total: profilesCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {object} request
   * @param {object} response
   * @returns {object} returns json response
   * @memberof ProfileController
   */
  static async updateRole(request, response) {
    const { id, role } = request.params;
    const user = await UserHelper.findById(id);

    HttpError.throwErrorIfNull(user, 'User not found!');

    const updatedUser = await user.update(
      { role },
      {
        where: { id }
      }
    );
    const data = UserHelper.getUserProfileData(updatedUser);
    return response.status(200).json({
      status: 'success',
      message: 'User role updated successfully!',
      data
    });
  }
}

export default ProfileController;
