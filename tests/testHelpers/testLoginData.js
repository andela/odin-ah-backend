/**
 * @exports testData
 * @description This file contains all dummy data for testing user Authentication
 *
 * */
const realUser = {
  email: 'Johnwilli@gmail.com',
  username: 'blackshady',
  password: '1234567AB',
};

const badEmail = {
  email: 'slimbabymail.com',
  password: '1234567AB',
};
const wrongEmail = {
  email: 'slimbaby@gmail.com',
  password: '1234567AB',
};
const noPass = {
  email: 'mosoes@gmail.com',
};

const wrongLength = {
  email: 'franckp@gmail.com',
  password: '187',
};
const emptyEmail = {
  email: '',
  password: '12',
};

export {
  realUser,
  badEmail,
  noPass,
  wrongLength,
  emptyEmail,
  wrongEmail
};
