const { mongoose, connection } = require("../config")
const dotenv = require("dotenv")
dotenv.config();

const imageSchema  = new mongoose.Schema({
    filename: {type: String , required: true },
    userId : {type:mongoose.ObjectId, required: true },
    whoUseIt: {type: String , required: true },
    why: {type: String , required: true },
    
});


module.exports = connection.model("Image", imageSchema);