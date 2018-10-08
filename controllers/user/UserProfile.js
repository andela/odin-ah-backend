import db from '../../models';
import UserHelper from '../../helpers/UserHelper';

const { User } = db;

/**
 * Profile
 */
class UserProfile {
  /**
   *
   * @param {request} request HTTP request
   * @param {response} response HTTP response
   * @param {response} next HTTP next response
   * @return {object} return response to user
   */
  static async updateProfile(request, response, next) {
    // fetch user details from authData.
    const { userId } = request.authData;
    const { email } = request.body;
    try {
      const [userResultById, userResultByEmail] = await Promise.all([
        UserHelper.findById(userId), UserHelper.findByEmail(email)
      ]);
      if (!userResultById) {
        return response.status(404)
          .json({ message: 'User not found!' });
      }
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
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * @param {request} request HTTP request
   * @param {response} response HTTP response
   * @param {response} next HTTP next response
   * @return {object} return response to user
   */
  static getProfile(request, response, next) {
    const { userId } = request.authData;
    return User
      .findById(userId) // collect user Id from token
      .then((user) => {
        if (!user) {
          return response.status(404)
            .json({
              message: 'User is not found'
            });
        }
        return response.status(200)
          .json({
            profile: {
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              bio: user.bio,
              imageUrl: user.imageUrl,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            },
            message: 'Successful!',
          });
      })
      .catch(error => next(error));
  }
}

export default UserProfile;
