const express = require("express")
const UsersRouter = express.Router()
const verifyToken = require("../db/Authentication")
const uploadMulterConfig = require("../helper/upload.js")

const {
    CreateNewUser,
    LoginUser,
    LogoutUser,
    uploadUserAvatar,
    GetProfileMeData
} = require (
    "../controller/user"
)

UsersRouter.post("/new" , CreateNewUser)
UsersRouter.post("/login" , LoginUser)
UsersRouter.put("/logout" ,verifyToken, LogoutUser)
UsersRouter.post("/upload-avatar" ,verifyToken,  uploadMulterConfig.single('file') , uploadUserAvatar)
UsersRouter.get("/get-profile-me-data" ,verifyToken, GetProfileMeData)


module.exports=UsersRouter
