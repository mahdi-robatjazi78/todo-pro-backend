const express = require("express")
const UsersRouter = express.Router()
const verifyToken = require("../db/Authentication")
const {uploadMulterConfig , uploadMulterSignupConfig} = require("../helper/upload.js")

const {
    SignupNewUser,
    uploadUserAvatarIntoSignup,
    LoginUser,
    LogoutUser,
    uploadUserAvatar,
    GetProfileMeData,
    updateOrRemoveUserProfileAvatar,
    updateOrRemoveUserProfileBanner,
    updateUserProfileData,
    updateUserPassword
} = require (
    "../controller/user"
)
// const SignupFilesUploaded = uploadMulterSignupConfig.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }])

UsersRouter.post("/signup" , SignupNewUser)
UsersRouter.put("/signup-upload" , uploadMulterConfig.single('file'), uploadUserAvatarIntoSignup)
UsersRouter.post("/login" , LoginUser)
UsersRouter.put("/logout" ,verifyToken, LogoutUser)
UsersRouter.post("/upload-avatar" ,verifyToken,  uploadMulterConfig.single('file') , uploadUserAvatar)
UsersRouter.get("/get-profile-me-data" ,verifyToken, GetProfileMeData)
UsersRouter.put("/edit-avatar" ,verifyToken, uploadMulterConfig.single('file') , updateOrRemoveUserProfileAvatar)
UsersRouter.put("/edit-banner" ,verifyToken, uploadMulterConfig.single('file') , updateOrRemoveUserProfileBanner)
UsersRouter.put("/edit-profile-data" ,verifyToken, updateUserProfileData)
UsersRouter.put("/edit-password" ,verifyToken, updateUserPassword)



module.exports=UsersRouter
