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
};
