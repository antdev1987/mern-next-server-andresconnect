import express from 'express';
import { isAuth } from '../utils.js';
import Espacio from '../models/publicarModel.js';
import { cloudinaryDeleteOneFile } from '../helpers/cloudinaryConfig.js';

const route = express.Router();

route.post('/crear-espacio', (req, res) => {
  try {
    console.log('estoy ruta crear-espacio');
    res.send('trabajando');
  } catch (error) {
    console.log(error);
  }
});

route.post('/publicar', isAuth, async (req, res) => {
  console.log('estoy en publciar');
  try {
    console.log(req.body.propiedadImg, 'elborody');
    console.log(req.body.scortImg, 'scort');
    const { propiedadImg } = req.body;
    // console.log(req.user);

    // console.log(data);

    const filterPublicar = await Espacio.findOne({
      userId: req.user._id,
    }).select('-userId');

    // filterPublicar.propiedadImg.push(...req.body);

    req.body.propiedadImg
      ? filterPublicar.propiedadImg.push(...req.body.propiedadImg)
      : (filterPublicar.propiedadImg = filterPublicar.propiedadImg);

    req.body.scortImg
      ? filterPublicar.scortImg.push(...req.body.scortImg)
      : (filterPublicar.scortImg = filterPublicar.scortImg);

    const info = await filterPublicar.save();

    console.log(filterPublicar, 'filterando');

    res.json(info);
  } catch (error) {
    console.log(error);
  }
});

route.get('/publicar', isAuth, async (req, res) => {
  console.log('estoy en publciar get');
  try {
    console.log(req.user._id);
    const filterPublicar = await Espacio.findOne({
      userId: req.user._id,
    }).select('-userId');
    // console.log(filterPublicar);
    res.json(filterPublicar);
  } catch (error) {}
});

route.delete('/publicar', isAuth, async (req, res) => {
  console.log('estoy ruta eliminar');
  console.log(req.query);

  try {
    await cloudinaryDeleteOneFile(req.query.publicId);
    const filterPublicar = await Espacio.findOne({
      userId: req.user._id,
    }).select('-userId');
    
    filterPublicar[`${req.query.sobre}Img`] = filterPublicar[
      `${req.query.sobre}Img`
    ].filter((item, idx) => item.publicId !== req.query.publicId);
    
    console.log(filterPublicar);
    
    await filterPublicar.save();
    // console.log(deleteLocal)
    // console.log(filterPublicar)
    res.send('elimnado exitosamente');
  } catch (error) {
    console.log(error);
  }
});
export default route;
