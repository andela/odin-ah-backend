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

UserConstraint.readingStats = {
  startDate: {
    presence: false,
    datetime: {
      dateOnly: true,
      format: 'YYYY-MM-DD' || 'YYYY-MM-DD hh:mm:ss',
      message: 'is not valid'
    }
  },
  endDate: {
    presence: false,
    datetime: {
      dateOnly: true,
      format: 'YYYY-MM-DD' || 'YYYY-MM-DD hh:mm:ss',
      message: 'is not valid'
    }
  },
  tag: {
    presence: false,
  }
};


export default UserConstraint;
