const mongoose = require("mongoose");

const dbURI =
  "mongodb://edu:root123@cluster0-shard-00-00-wydxk.mongodb.net:27017,cluster0-shard-00-01-wydxk.mongodb.net:27017,cluster0-shard-00-02-wydxk.mongodb.net:27017/prueba?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";

const options = {
  reconnectTries: Number.MAX_VALUE,
  poolSize: 10
};

mongoose.connect(dbURI, options).then(
  () => {
    console.log("Database connection established!");
  },
  err => {
    console.log("Error connecting Database instance due to: ", err);
  }
);

// require any models

require("../models/Task");
