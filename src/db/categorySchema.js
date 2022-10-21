const { mongoose, connection } = require("./config")
const dotenv = require("dotenv")
dotenv.config();

const categorySchema = new mongoose.Schema({
  title: {type:String , required:true, trim:true },
  ownerId: {type:mongoose.ObjectId, required: true },
  uuid:{type:String,required:true},
  task_count:{type : Number , required:true}
});


module.exports = connection.model("Categories", categorySchema);