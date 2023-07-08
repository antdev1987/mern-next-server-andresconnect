// import mongoose from 'mongoose';

const mongoose = require('mongoose')


const userModel = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is a required field'],
    },
    password: { type: String, required: [true, 'Pass is a required field'] },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userModel);

// export default User;
module.exports = User;

