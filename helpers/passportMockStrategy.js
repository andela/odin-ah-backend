import passport from 'passport';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */

const user = {
  id: '354496',
  displayName: 'John Doe',
  username: 'johndoe',
  emails: [{ value: 'johndoe@gmail.com' }],
  photos: [{ value: 'https://someimageurl.net' }],
  provider: 'mock'
};
/**
 * @class Strategy
 */
class Strategy extends passport.Strategy {
  /**
   *Creates an instance of Strategy.
   * @param {*} name
   * @param {*} strategyCallback
   * @memberof Strategy
   */
  constructor(name, strategyCallback) {
    if (!name || name.length === 0) {
      throw new TypeError('Strategy requires a Strategy name');
    }
    super(name, strategyCallback);
    this.name = name;
    this._user = user;
    this._cb = strategyCallback;
  }

  /**
   * @override
   * @returns {Function} - Callback function
   * @memberof Strategy
   */
  authenticate() {
    this._cb(null, null, this._user, (error, user) => {
      this.success(user);
    });
  }
}

const MockStrategy = Strategy;

export { MockStrategy, user };
