const sjcl = require("sjcl");
const bcrypt = require("bcryptjs");

module.exports = {
  addTime: function (dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  },

  generateToken: function () {
    const seed = (Math.random() + 1).toString(36).substring(7);

    const bitArray = sjcl.hash.sha256.hash(seed);
    return sjcl.codec.hex.fromBits(bitArray);
  },
  
  generateRoomToken: function () {
    const seed = (Math.random() + 1).toString(36).substring(7);

    const bitArray = sjcl.hash.sha256.hash(seed);
    return sjcl.codec.hex.fromBits(bitArray).substring(0, 6);
  },
  
  validateInputUrl : function (input) {
    const reInputStringShort = /^https:\/\/youtube\.com\/watch\?v=[a-zA-Z0-9_]+$/;
    const reInputStringFull = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_]+$/;

    if (!reInputStringShort.test(input) && !reInputStringFull.test(input) ) {
        return false;
    } else {
        return true;
    }
  },

  bcryptHash: async function (password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  bcryptCompare: async function (password, user) {
    return await bcrypt.compare(password, user.password);
  },

  validatePassword: function (password) {
    const rePassword =
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

    if (
      password.toString().length < 8 ||
      !rePassword.test(password.toString().trim())
    )
      return false;
    else return true;
  },

  validateUsername: function (username) {
    
    const reUsername =
      /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){2,18}[a-zA-Z0-9]$/;

    if (!reUsername.test(username.toString().trim())) return false;
    else return true;
  },

  validateEmail: function (email) {
    const reEmail =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!reEmail.test(email.toString().trim())) return false;
    else return true;
  },
};
