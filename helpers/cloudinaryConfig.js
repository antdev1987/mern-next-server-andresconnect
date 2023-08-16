import { v2 as cloudinary } from "cloudinary";

import sharp from "sharp";
import fs from "fs";
import tmp from 'tmp'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
    this function helps you to upload multiple raw files to cloudinary
    parameter files => it is the information of the files you want to upload this info is provided by multer
    parameter folder => you can send the name of the folder you want to upload the files it can also be a string
*/
const cloudinaryUploadFiles = async (files, folder) => {
  try {
    const filesCloudinaryInfo = [];

    for (const file of files) {
      const { path, originalname } = file;

      //codigo de abajo es para reducir el tamano de la imagen antes de pasarlo a cloudinary
      // Lee el archivo con sharp
      const image = sharp(path);
      // Redimensiona la imagen a una altura y ancho máximos
      const resizedImage = await image
        // .resize({ width: 1600, height: 1200, fit: "inside" })
        .resize({ width: 800, height: 600, fit: "inside" })
        .jpeg({ quality: 70 })
        .toBuffer();
      const tempPath = `./temp_${originalname}`;
      fs.writeFileSync(tempPath, resizedImage);

      //aqui ya se pasa a cloudinary el nuevo tamano de la imagen 
      const newPath = await cloudinary.uploader.upload(tempPath, {
        // resource_type: "raw", // this is to accept any type of document likes office docuemnt if you are just only acept image do not use this option
        //folder: `actas/${folder}`,//this works when you create a root folder in home and want to create folder inside there for your project
        folder: folder, // this will create the folder just in the root directory of cloudinary the home folder
        use_filename: true,
        unique_filename: true,
        filename_override: originalname,
        //  quality:80,
        //  format:'webp'
      });

       // Elimina el archivo temporal después de cargarlo en Cloudinary
       fs.unlinkSync(tempPath);

      const resolve = {
        cloudinary_id: newPath.public_id,
        cloudinary_url: newPath.secure_url,
        originalname: file.originalname,
      };
      filesCloudinaryInfo.push(resolve);
    }

    return filesCloudinaryInfo;
  } catch (error) {
    console.log(error);
  }
};










//this delete one file or list of file if you use a loop to pass all the prublic id to delete
const cloudinaryDeleteOneFile = async (public_id) => {
  console.log(public_id, "en la funcion");
  const result = await cloudinary.uploader.destroy(public_id);
  console.log(result)
  return result;
};

export { cloudinaryUploadFiles, cloudinaryDeleteOneFile };
