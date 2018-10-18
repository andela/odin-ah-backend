/**
 * @exports testData
 * @description This file contains all dummy data for testing user Authentication
 *
 * */
const realUser = {
  email: 'Johnwilli@gmail.com',
  username: 'blackshady',
  password: '1234567AB'
};
const realUserWithWrongPassword = {
  email: 'johnwilli@gmail.com',
  username: 'blackshady',
  password: '1234567CA'
};
const realUser1 = {
  email: 'real.user@local.host',
  username: 'realUser',
  password: '1234567AB'
};
const realUser2 = {
  email: 'real.user.2@local.host',
  username: 'realUser2',
  password: '1234567AB',
};

const badEmail = {
  email: 'slimbabymail.com',
  password: '1234567AB'
};
const wrongEmail = {
  email: 'slimbaby@gmail.com',
  password: '1234567AB'
};
const noPass = {
  email: 'mosoes@gmail.com'
};

const wrongLength = {
  email: 'franckp@gmail.com',
  password: '187'
};
const emptyEmail = {
  email: '',
  password: '12'
};
const sampleUser = {
  email: 'victorbk1234@gmail.com',
  username: 'victorbk1234',
  password: '108275386vgmdj678',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser2 = {
  email: 'victorbk14@gmail.com',
  username: 'great34',
  password: '108275386vgmdj678',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser3 = {
  email: 'Aliquam.erat.volutpat@sagittisplacerat.edu',
  username: 'Kellie',
  password: 'HBF51DQC2JU',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser4 = {
  email: 'Etiam.bibendum.fermentum@accumsanlaoreetipsum.net',
  username: 'Cathleen',
  password: 'UMR78YRX3OP',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser5 = {
  email: 'Nam.ac.nulla@malesuadafamesac.edu',
  username: 'Amarachai',
  password: 'PJB30UQF8RL',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser6 = {
  email: 'Aliquam.erat@convallisdolorQuisque.ca',
  username: 'Mesoma',
  password: 'HBF51DQC2JU',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const sampleUser7 = {
  email: 'magna.tellus.faucibus@ac.org',
  username: 'Karinatu',
  password: 'HBF51DQC2JU',
  isVerified: true,
  token: 'ykwh8ws31yiykwh8ws31yi',
};
const fakeNotification = {
  id: 20,
  userId: 2,
  isRead: true,
  message: 'your village people started following you Wednesday, October 17, 2018 9:15 AM ago',
  createdAt: '2018-10-17 09:15:23.791+01',
  updatedAt: '2018-10-25 09:15:23.791+01'
};
export {
  realUser,
  realUser1,
  realUser2,
  badEmail,
  noPass,
  wrongLength,
  emptyEmail,
  wrongEmail,
  realUserWithWrongPassword,
  sampleUser,
  sampleUser2,
  sampleUser3,
  sampleUser4,
  sampleUser5,
  sampleUser6,
  sampleUser7,
  fakeNotification
};
