import multer from "multer";
import path from 'path'


const upload = multer({

    storage:multer.diskStorage({}),
    filename:function(req,file,cb){
        cb(null,file.originalname)
    },

    fileFilter:function(req,file,callback){
        var ext = path.extname(file.originalname)
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif' && ext !== '.tif') { //just accepting those types of files
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE'))
        }
        callback(null, true)
    },

    //se supone que podes subir 3 archivos de 30 cada uno y entonces no superar los 90 megas no seguro al 100%
    limits:{fileSize:30000000,files:3,fieldSize: 3 * 30 * 1024 * 1024}

}).array('uploadImages')


export {upload}