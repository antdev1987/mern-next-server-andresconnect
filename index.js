// import express from 'express';
// import cors from 'cors';
// import * as dotenv from 'dotenv';
// import mongoose from 'mongoose';

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
// require('dotenv').config();
const mongoose = require('mongoose')
const app = express();
dotenv.config();


// app.use(cors())


// routes import
// import userRouter from './routes/userRoutes.js';
const userRouter = require('./routes/userRoutes')

// Config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));
dotenv.config();

// Routes
app.use('/api/user', userRouter);

const port = process.env.PORT || 4000

app.listen(port, async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log('Data Base Connected'))
      .catch((err) => console.log(err));
    console.log('Servidor en Vivo');
  } catch (error) {
    console.log(error);
  }
});
