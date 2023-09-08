const multer = require('multer');
const path  = require('path')


// Set up multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const currentDirectory = __dirname;

        const destinationFileUpload= path.resolve(currentDirectory,'..','..','public', "uploads") 

        console.log("destinationFileUpload "  , destinationFileUpload)

      cb(null, destinationFileUpload); // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname
        console.log("file-->" , file)
      cb(null , filename ); // Set the filename
    } 
});



// Set up multer disk storage
const SignupStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const currentDirectory = __dirname;

        const destinationFileUpload= path.resolve(currentDirectory,'..','..','public', "uploads")

        cb(null, destinationFileUpload);
    },
    filename: (req, file, cb) => {


        // console.log("req ->",req)
        console.log("file->",file)

        const filename = Date.now() + '-' + file.originalname
        // console.log("file-->" , file)
        cb(null , filename ); // Set the filename
    }
});


 
// Initialize multer upload
const uploadMulterConfig = multer({ storage: storage });
const uploadMulterSignupConfig = multer({ storage: SignupStorage });

module.exports = {uploadMulterConfig , uploadMulterSignupConfig}
