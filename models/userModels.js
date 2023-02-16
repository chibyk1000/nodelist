const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  default: 'http://localhost:3000/img/default.png'
  },
  role: {
    type: String,
    default: "user",
  },
});

const UserModel = mongoose.model('Users', userSchema)
module.exports = UserModel
