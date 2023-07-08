import express from "express";
import bcryptjs from "bcryptjs";
import User from "../models/userModel.js";
// import jwt from 'jsonwebtoken';

import { generateToken } from "../utils.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {

  const { name, email, password } = req.body;
  
  console.log('register route')


  try {
    const isUserDb = await User.findOne({ email });

    //checking if user already exist
    if (isUserDb) {
      return res.status(400).json({ message: "User already Registered" });
    }

    const newUser = new User({
      name,
      email,
      password: password != "" ? bcryptjs.hashSync(password) : "",
    });

    // newUser.token =
    //   Math.random().toString(32).substring(2) + Date.now().toString(32);

    await newUser.save();

    console.log('testi')

    const userAuthenticated = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      isAdmin: newUser.isAdmin,
      token: generateToken(newUser),
    };

    res.json({
      message:
        "User succesfully created, please login",
     userAuthenticated 
    });

  } catch (error) {

    console.log(error);
    //to check mongoose validation error like empty data
    if (error.name === "ValidationError") {
      let errors = [];

      Object.keys(error.errors).forEach((key) => {
        //   errors[key] = error.errors[key].message;
        errors.push(error.errors[key].message);
      });
      return res.status(400).send({ message: errors.join(" ||| ") });
    }

    res.status(500).send({ message: "Something went wrong" });
  }

  
});

//login endpoint
userRouter.post("/logIn", async (req, res) => {
  const { email, password } = req.body;
  console.log("login route");

  try {
    const userDb = await User.findOne({ email });

    //check if user exist
    if (!userDb) {
      return res.status(404).json({ message: "User Does Not Exist" });
    }

    // //check if user is verified
    // if (!userDb.isVerified) {
    // 	return res.status(400).json({ message: 'Your Accounts has not been verified' })
    // }

    //check if password match
    if (!bcryptjs.compareSync(password, userDb.password)) {
      return res.status(401).send({ message: "Email or Password Wrong" });
    }

    const userAuthenticated = {
      _id: userDb._id,
      email: userDb.email,
      name: userDb.name,
      isAdmin: userDb.isAdmin,
      token: generateToken(userDb),
    };

    res.json(userAuthenticated);
  } catch (error) {
    console.log(error);
  }


});

export default userRouter;
// module.exports = userRouter;
