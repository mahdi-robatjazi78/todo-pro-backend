const { mongoose, connection } = require("../config")
const dotenv = require("dotenv")
const mongoosePaginate = require('mongoose-paginate');
dotenv.config();

const todoScheme = new mongoose.Schema({
  body: {type:String,required:true, trim:false },
  date: {type:Date, required: true },
  expireTime: {type:String, required:false},
  flag: {type:String, required: true },
  owner:{type:mongoose.ObjectId , required:true},
  categoId:{
    type:String , required:false
  },
  ws:{type:String,required:true}
});

todoScheme.plugin(mongoosePaginate)


module.exports = connection.model("Todos", todoScheme);