export default {
  secret:
        process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  db: {
    development: process.env.DB_URI,
    test: process.env.DB_URI_TEST
  }
};
