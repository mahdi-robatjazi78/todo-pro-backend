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
        console.log("filename-->" , filename)
      cb(null , filename ); // Set the filename
    } 
});



// setup multer mongodb storage

// const storage = new GridFsStorage({
//     url: URI,
//     file: (req, file) => {
//         console.log("into storage --->>" , req.user)
//       return new Promise((resolve, reject) => {
//           const filename = file.originalname;
//           const fileInfo = {
//             filename: filename,
//             bucketName: 'uploads'
//           };
//           resolve(fileInfo);
//       });
//     }
//   });


 
// Initialize multer upload
const uploadMulterConfig = multer({ storage: storage });

module.exports = uploadMulterConfig
