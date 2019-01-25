const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorialSchema = new Schema({
  SesionId:{
      type: String,
      required:true,
  },
  UsuarioId:{
        type: Number,
        required:true
      },
  UsuarioDice:{
        type: String,
        required:true
  },
  NombreIntento:{
        type: String,
        required:true
  },
  BotResponde:{
        type: String,
        required:true
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Historiales", HistorialSchema);
