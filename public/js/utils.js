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

  bcryptHash: async function (password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  bcryptCompare: async function (password, user) {
    return await bcrypt.compare(password, user.password);
  },
};
