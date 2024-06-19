const mongoose = require("mongoose");
const { userRoles } = require("../constants/constants");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email address"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please add a password"],
  },

  role: {
    type: String,
    enum: [userRoles.GUEST, userRoles.HOST, userRoles.ADMIN],
    default: userRoles.GUEST,
  },
});

module.exports = mongoose.model("User", userSchema);
