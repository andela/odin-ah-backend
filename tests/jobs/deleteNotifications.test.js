import chai from 'chai';
import sinon from 'sinon';
import deleteNotifications from '../../jobs/index';
import db from '../../models';

const { Notifications } = db;

const { expect } = chai;

const notificationsData = [
  {
    id: 1,
    userId: 3,
    senderId: 9,
    isRead: true,
    message: 'lacus vestibulum lorem, sit a a tortor.',
    createdAt: '2018-10-03 16:35:51.401+01',
    updatedAt: '2018-10-16 16:35:51.401+01'
  },
  {
    id: 2,
    userId: 5,
    senderId: 5,
    isRead: true,
    message: 'risus varius orci, adipiscing non.',
    createdAt: '2018-10-03 16:35:51.401+01',
    updatedAt: '2018-10-06 16:35:51.401+01'
  },
  {
    id: 3,
    userId: 1,
    senderId: 5,
    isRead: true,
    message: 'at pede. Cras vulputate velit eu semtrices.',
    createdAt: '2018-10-03 16:35:51.401+01',
    updatedAt: '2018-10-15 16:35:51.401+01'
  },
  {
    id: 4,
    userId: 10,
    senderId: 8,
    isRead: true,
    message: 'ullamcorper. Duis at lacus. Quisque purus sapien',
    createdAt: '2018-10-03 16:35:51.401+01',
    updatedAt: '2018-10-24 16:35:51.401+01'
  },
  {
    id: 5,
    userId: 8,
    senderId: 1,
    isRead: false,
    message: 'dui. Fusce aliquam, enim nec tempus scelerisque',
    createdAt: '2018-10-03 16:35:51.401+01',
    updatedAt: '2018-10-12 16:35:51.401+01'
  }
];

describe('deleteReadNotification', () => {
  before('Delete Notifications', async () => {
    await Notifications.destroy({
      cascade: true,
      truncate: true
    });
  });
  before('Create Notifications', async () => {
    await Notifications.bulkCreate(notificationsData);
  });
  it('should log the error if deleteNotifications method fails', async () => {
    const stub = sinon.stub(Notifications, 'destroy').rejects();
    const error = await deleteNotifications();
    expect(error).to.be.equal(undefined);
    stub.restore();
  });
  it('should delete all notifications 1 week after they have been read', async () => {
    const { deleted } = await deleteNotifications();
    expect(deleted).to.equal(4);
  });
});
