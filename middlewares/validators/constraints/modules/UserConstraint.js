/**
 *
 *
 * @class UserConstraint
 */
class UserConstraint {

}

UserConstraint.beginResetPassword = {
  email: {
    presence: true,
    email: {
      message: 'is invalid'
    },
  }
};

UserConstraint.completeResetPassword = {
  password: {
    presence: true,
    length: {
      minimum: 8,
      message: 'must be at least 8 characters'
    },
  }
};

export default UserConstraint;
