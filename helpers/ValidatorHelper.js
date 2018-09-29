/**
 * @exports ValidatorHelper
 * @class ValidatorHelper
 * @description  Contains simple validation Methods
 *  */
export default class ValidatorHelper {
  /**
     * @param{String} email - the email be verified
     * @return {Boolean} Returns boolean
     */
  static isEmail(email) {
    return (email.match(/\S+@\S+\.\S+/));
  }

  /**
     * @param  {String} value - the value to verify if it empty
     * @returns  {Boolean} Returns boolean
     */
  static isEmpty(value) {
    return (!value || typeof value === 'undefined' || value.trim === '' || value.length === 0);
  }

  /**
     * @param  {String} data - the value to verify the length is up to 5
     * @returns  {Boolean} Returns boolean
     */
  static isMinLen(data) {
    return data.length >= 8;
  }
}
