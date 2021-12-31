const mongoose = require("mongoose");
const User = mongoose.model("user", {
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userid: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  }
});

module.exports = User;
