const express = require("express")
const UsersRouter = express.Router()



const {
    CreateNewUser,
    LoginUser,
    LogoutUser
} = require (
    "../controller/userController"
)



UsersRouter.post("/new" , CreateNewUser)
UsersRouter.post("/login" , LoginUser)
UsersRouter.put("/logout" , LogoutUser)

module.exports=UsersRouter
