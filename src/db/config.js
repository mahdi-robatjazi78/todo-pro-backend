const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const dotenv = require("dotenv") 
dotenv.config()




// console.log("ENVIRONMENT ++++.." , process.env.NODE_ENV ,  process.env.DB_URL_DEV ,  process.env.DB_URL_PRO )
// const ENVIRONMENT = process.env.NODE_ENV

// const url = ENVIRONMENT === "DEVELOPMENT" ? process.env.DB_URL_DEV : process.env.DB_URL_PRO
const dbname = process.env.DB_NAME
const port = process.env.DB_PORT

// const URI = ENVIRONMENT === "DEVELOPMENT" ? url + port + "/" + dbname : url 	
 


console.log("::URI::" , process.env.DB_URL_DEV );

const URI = process.env.DB_URL_DEV;

const CONFIG = { 
	useNewUrlParser: true,
	useUnifiedTopology: true,
}
 

const conn = mongoose.createConnection(URI , CONFIG)
  
conn.on("error", console.error.bind(console, "connection error:"))
 
  
  
exports.mongoose = mongoose 
exports.connection = conn