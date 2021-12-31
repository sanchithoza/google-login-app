const mongoose = require("mongoose");
const Schema = mongoose.Schema;
schema = new Schema({
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
}, {
    timestamps: true
});
const User = mongoose.model("user", schema);

module.exports = User;
