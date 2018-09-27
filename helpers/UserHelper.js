import user from '../models';
import logger from './logger';

const { User } = user;


/**
 * @exports UserHelper
 * @class UserHelpers
 * @description Contains methods to assist User
 * */
class UserHelper {
    /**
     * Find a paticular user  by emial
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
}
export default UserHelper;