import passport from 'passport';
import crypto from 'crypto';
import { Strategy as LocalStrategy } from 'passport-local';
import db from '../models';

const { User } = db;

/**
 *
 * @param {string} password
 * @param {User} user
 * @return {boolean} returns true is the password is valid
 */
function validatePassword(password, user) {
  const hash = crypto
    .pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
    .toString('hex');
  return user.hash === hash;
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]'
    },
    ((email, password, done) => {
      User.findOne({ where: { email } })
        .then((user) => {
          if (!user || !validatePassword(password, user.dataValues)) {
            return done(null, false, {
              errors: { 'email or password': 'is invalid' }
            });
          }

          return done(null, user);
        })
        .catch(done);
    })
  )
);
