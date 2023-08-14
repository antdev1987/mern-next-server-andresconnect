import express from "express";
import bcryptjs from "bcryptjs";
import User from "../models/userModel.js";
import axios from "axios";
import { generateToken, isAuth } from "../utils.js";
import { upload } from "../helpers/multer.js";
import { cloudinaryUploadFiles } from "../helpers/cloudinaryConfig.js";
import nodemailer from "nodemailer";

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  console.log("register route");

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

    console.log("testi");

    const userAuthenticated = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      isAdmin: newUser.isAdmin,
      token: generateToken(newUser),
    };

    res.json({
      message: "User succesfully created, please login",
      userAuthenticated,
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
      isVerificationProcess: userDb.isVerificationProcess,
      token: generateToken(userDb),
    };

    res.json(userAuthenticated);
  } catch (error) {
    console.log(error);
  }
});

//login with google
userRouter.post("/googlelogin", async (req, res) => {
  console.log("en la ruto google login");
  const { access_token } = req.body; //access token sent from frot ent using the package @react-oauth/google
  try {
    //getting aud field to check client id match with our clien id sent from frontend
    const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`;
    const { data } = await axios(url);

    //here we compare if the client id sent from react is same of the client id of our app
    if (data.aud != process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(400)
        .send({ message: "Access Token not meant for this app." });
    }

    //after checking access token is valid and from our app now we need to get the userinfo
    //for the login or register funtionallity
    const urlToGetUserInfo = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;
    const resp = await axios(urlToGetUserInfo);
    const { email_verified, name, email, sub } = resp.data; //destructuring data we need

    //checking if google email es virified or not
    if (!email_verified) {
      return res
        .status(400)
        .send({ message: "it seems your google account is not verified" });
    }

    //now checking if an user with this given email exist or not
    const userDb = await User.findOne({ email });

    //this happen if you already have an account with this google email
    if (userDb) {
      const userAuthenticated = {
        _id: userDb._id,
        email: userDb.email,
        name: userDb.name,
        isAdmin: userDb.isAdmin,
        isVerificationProcess: userDb.isVerificationProcess,
        token: generateToken(userDb),
      };
      return res.json(userAuthenticated);
    }

    //this happen if we do not have an account with this google email, so we create one
    if (!userDb) {
      const newUser = new User({
        name,
        email,
        isVerified: true,
        password: bcryptjs.hashSync(email + Math.random() + sub),
      });
      await newUser.save();

      const userAuthenticated = {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        isVerificationProcess: newUser.isVerificationProcess,
        token: generateToken(newUser),
      };
      return res.json(userAuthenticated);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "something went wrong" });
  }
});

userRouter.post("/userverification", isAuth,  async (req, res) => {
  console.log("en ruta user verification");

  console.log(req.body)

  //  console.log(req.user)

  //definde and put credential using nodemailer to send emails
  // const transport = nodemailer.createTransport({
  //   host:'smtp.gmail.com',
  //   auth:{
  //     user:process.env.EMAIL_USER,
  //     pass:process.env.EMAIL_PASS
  //   }
  // })
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "229ed09a150b2b",
      pass: "81672d1564bcad"
    }
  });

  try {
    const userDb = await User.findById(req.user._id);

    // console.log(userDb, "db");

    userDb.isVerificationProcess = true || userDb.isVerificationProcess;

    await userDb.save();

    // const cloudinaryResut = await cloudinaryUploadFiles(
    //   files,
    //   "userverification"
    // );

    // console.log(cloudinaryResut);

    //enviando el correo
    const info = await transport.sendMail({
      from: "Andress-Connect <antdev1987@gmail.com>",
      to: "antdev1987@gmail.com",
      subject: "Confirmation Process",
      text: "Aqui tienes las fotos para la verification",
      html: `
            <p> Hola: aqui estan las imagenes para verificacion </p>
            <p> click en cada enlace para descargar la imagen </p>


            <ul>
            ${req.body.images
              .map(
                (result) =>
                  `<li><a href='${result.url}'>click para descargar</a></li>`
              )
              .join("")}
       
            </ul>

            
            <p>intentar verificar antes de 48 horas</p>
            `,
    });

    // ${cloudinaryResut
    //   .map(
    //     (result) =>
    //       `<li><a href='${result.cloudinary_url}'>click para descargar</a></li>`
    //   )
    //   .join("")}

    // console.log(info);

    res.send("imagen guardada");
  } catch (error) {
    console.log(error);
  }
});

export default userRouter;
// module.exports = userRouter;
