const { mongoose, connection } = require("../config")
const dotenv = require("dotenv")
dotenv.config();

const workSpaceSchema = new mongoose.Schema({

    title:{type:String,required:true, trim:true},
    date: {type:Date, required: true },
    owner:{type:mongoose.ObjectId , required:true},
    id:{type:String , required:true},
    active:{type:Boolean , required:true},
    todoSum:{type:Number , required:true}

});


module.exports = connection.model("Workspaces", workSpaceSchema);