import passport from 'passport/lib';
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
     * @return {object} return response with JSON data and status code
     */
  static getUser(req, res, next) {
    User.findById(req.body.id)
      .then((user) => {
        if (!user) {
          return res.sendStatus(404);
        }
        return res.json({ user: UserController.toJSON(user.dataValues) });
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
  static updateUser(req, res, next) {
    User.findById(req.body.user.id)
      .then((user) => {
        if (!user) {
          return res.sendStatus(404);
        }

        // only update fields that were actually passed...
        if (req.body.user.username) {
          user.username = req.body.user.username;
        }
        if (req.body.user.email) {
          user.email = req.body.user.email;
        }
        if (req.body.user.bio) {
          user.bio = req.body.user.bio;
        }
        if (req.body.user.image) {
          user.image = req.body.user.image;
        }
        if (req.body.user.password) {
          user.hash = req.body.user.password;
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
  static loginUser(req, res, next) {
    if (!req.body.user.email) {
      return res.status(422).json({ errors: { email: 'can\'t be blank' } });
    }

    if (!req.body.user.password) {
      return res.status(422).json({ errors: { password: 'can\'t be blank' } });
    }
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (user) {
        return res.json({ user: UserController.toJSON(user.dataValues) });
      }
      return res.status(422).json(info);
    })(req, res, next);
  }

  /**
     *
     * @param {request} req HTTP request
     * @param {response} res HTTP response
     * @param {next} next
     * @return {object} return response to user
     */
  static createUser(req, res, next) {
    const { username, email, password } = req.body.user;
    User.create({ username, email, hash: password })
      .then(user => res.json({ user: UserController.toJSON(user.dataValues) }))
      .catch(next);
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
