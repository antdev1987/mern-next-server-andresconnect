// import express from 'express';
// import bcrypt from 'bcrypt';
// import User from '../models/userModel.js';
// import jwt from 'jsonwebtoken';


const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')


const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    const existUser = await User.findOne({ email: data.email });

    if (existUser) {
      return res.status(500).json({ ok: false, msg: 'El correo ya existe' });
    }

    // encriptar password
    data.password = await bcrypt.hash(data.password, 10);

    // Guardar usuario
    const newUser = await User.create(data);

    // Creando Token
    const token = jwt.sign({ id: newUser._doc._id }, process.env.SIGN);

    delete newUser._doc.password;
    delete newUser._doc._id;

    res.json({
      ok: true,
      msg: 'El usuario fue creado exitosamente',
      data: {
        token,
        ...newUser._doc,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
});

userRouter.post('/logIn', async (req, res) => {
  try {
    const data = req.body;

    // Verificando Email y Password
    const verifyUser = await User.findOne({ email: data.email });

    // Comparamos Passwords
    const verifyPassword = !verifyUser
      ? false
      : await bcrypt.compare(data.password, verifyUser.password);

    // Mandamos el Error
    if (!(verifyUser && verifyPassword)) {
      return res
        .status(404)
        .json({ ok: false, msg: 'Correo o password incorrectos' });
    }

    // Creando Token
    const token = jwt.sign({ id: verifyUser._doc._id }, process.env.SIGN);

    delete verifyUser._doc._id;
    delete verifyUser._doc.password;

    res.json({
      ok: true,
      msg: 'Te logueaste con exito',
      data: { ...verifyUser._doc, token },
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// export default userRouter;
module.exports = userRouter;
