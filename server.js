import socket from 'socket.io';
import app from './index';
import logger from './helpers/logger';
import notification from './controllers/user/Notification';

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});

const io = socket(server);

(() => {
  io.on('connection', () => notification.notify(io));
})();
