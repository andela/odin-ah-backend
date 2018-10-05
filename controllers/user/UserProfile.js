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
  static updateProfile(request, response, next) {
    // fetch user details from authData.
    const { userId } = request.authData;
    const { email } = request.body;

    User.findById(userId)
      .then((userData) => {
        if (userData) {
          UserHelper.findByEmail(email)
            .then((user) => {
              if (user && userData.dataValues.id !== user.dataValues.id) {
                response.status(409).json({
                  message: 'This Email already exists, choose another email'
                });
              } else {
                const updateFields = UserHelper.getUpdateFields(request);
                userData.update(
                  updateFields,
                  {
                    where: {
                      id: userId
                    }
                  }
                )
                  .then(updatedUser => response.status(200).json({
                    message: 'Profile Updated Successfully!',
                    data: updatedUser
                  }));
              }
            });
        } else {
          return response.status(404).json({
            message: 'User not found!'
          });
        }
      })
      .catch(error => next(error));
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
          return response.status(404).json({
            message: 'User is not found'
          });
        }
        return response.status(200).json({
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
