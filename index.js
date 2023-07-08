import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// routes import
import userRouter from './routes/userRoutes.js';

// Config
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));
dotenv.config();

// Routes
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('Desde la pagina de inicio')
})

const port = 4000 || process.env.PORT;

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
