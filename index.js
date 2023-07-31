import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import 'dotenv/config'

import mongoose from 'mongoose';

import multer from 'multer';

import cron from 'node-cron'
import axios from 'axios'




const app = express();



app.use(cors())


// routes import
import userRouter from './routes/userRoutes.js';
// const userRouter = require('./routes/userRoutes')

// Config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));
dotenv.config();


app.get('/keep-alive', (req, res) => {
  console.log('Recibida solicitud en el endpoint /keep-alive');
  res.send('El servidor Render está activo.');
});

const servidorRenderURL = 'https://mern-next-server-andresconnect.onrender.com/keep-alive';

// Función para realizar la solicitud HTTP al servidor Render
const mantenerServidorActivo = async () => {
  try {
    // Realizar la solicitud GET al endpoint para mantener el servidor Render activo
    console.log(servidorRenderURL)
    const {data} = await axios(servidorRenderURL);
    console.log(data)
    console.log('Solicitud realizada correctamente. El servidor Render está activo.');
  } catch (error) {
    console.error('Error al realizar la solicitud:', error.message);
    // Aquí puedes agregar lógica adicional para manejar el error, como enviar una notificación o intentar nuevamente.
  }
};

// Programar la tarea para que se ejecute cada 10 minutos
cron.schedule('*/10 * * * *', mantenerServidorActivo);


/* 
    code bellow is just to handle multer errors so that,
    you can show nices custom error to client if one of these error occurs
*/
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "file size too large (2 MB + not allowed)" });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: "just 3 files per operation is allowed" });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "format file not supported" });
    }
  }
});

// Routes of the application
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
