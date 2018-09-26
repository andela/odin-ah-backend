import db from '../models/index';

const { User } = db;
/**
 * UserController
 */
export default class UserController {
  /**
     *
     * @param {request} req HTTP request
     * @param {response} res HTTP response
     * @param {next} next
     * @return {object} return response to user
     */
  static updateUser(req, res, next) {
    User.findById(req.body.id)
      .then((user) => {
        if (!user) {
          return res.sendStatus(404);
        }

        // only update fields that were actually passed...
        if (req.body.username) {
          user.username = req.body.username;
        }
        if (req.body.email) {
          user.email = req.body.email;
        }
        if (req.body.bio) {
          user.bio = req.body.bio;
        }
        if (req.body.image) {
          user.image = req.body.image;
        }
        if (req.body.password) {
          user.hash = req.body.password;
        }

        return user.save()
          .then(() => res.json({ user: UserController.toJSON(user.dataValues) }));
      })
      .catch(next);
  }

  /**
     *
     * @param {request} req HTTP request
     * @param {response} res HTTP response
     * @param {next} next
     * @return {object} return response to user
     */
  static createUser(req, res, next) {
    const { username, email, password } = req.body;
    User.create({ username, email, hash: password })
      .then(user => res.json({ user: UserController.toJSON(user.dataValues) }))
      .catch(err => next(err));
  }

  /**
     *
     * @param {User} user
     * @return {object} return username and email address
     */
  static toJSON(user) {
    const { email, username } = user;
    return { email, username };
  }
}
