
const createToken = () => {
  const tokenValue = Math.random().toString(36).substr(2);
  return tokenValue + tokenValue;
};


export default createToken;
