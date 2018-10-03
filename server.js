import app from './index';
import logger from './helpers/logger';

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
