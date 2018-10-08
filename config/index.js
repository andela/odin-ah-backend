export default {
  secret:
        process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  baseUrl: process.env.BASE_URL,
  jwtSecret: process.env.JWTSECRET,
  passwordResetExpiry: process.env.PASSWORD_RESET_EXPIRY || '5h',
};
