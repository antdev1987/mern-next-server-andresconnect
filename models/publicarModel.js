import mongoose from "mongoose";

const { Schema } = mongoose;

const espacioSchema = new Schema(
  {
    propiedadImg: { type: Array },
    scortImg: { type: Array },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    espacioInfo: {type: Object},
  },
  { timestamps: true }
);

const Espacio = mongoose.model('Espacio', espacioSchema);

export default Espacio;
