export default {
  secret:
        process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  baseUrl: process.env.BASE_URL,
  jwtSecret: process.env.JWTSECRET,
  passwordResetExpiry: process.env.PASSWORD_RESET_EXPIRY || '5h',
  toneAnalyzerConfig: {
    username: process.env.SERVICE_NAME_USERNAME,
    password: process.env.SERVICE_NAME_PASSWORD,
    version: '2017-09-21',
    url: process.env.SERVICE_NAME_URL
  }
};
