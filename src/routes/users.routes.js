const express = require("express")
const UsersRouter = express.Router()
const verifyToken = require("../db/Authentication")
const {
    CreateNewUser,
    LoginUser,
    LogoutUser,
} = require (
    "../controller/user"
)

UsersRouter.post("/new" , CreateNewUser)
UsersRouter.post("/login" , LoginUser)
UsersRouter.put("/logout" ,verifyToken, LogoutUser)

module.exports=UsersRouter
